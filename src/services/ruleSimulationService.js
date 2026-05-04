import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

const useRestApi = !!import.meta.env?.VITE_API_BASE_URL;

/**
 * Rule Simulation Service
 * Tests rule conditions against real customer data from fatca_dataset
 */
export const ruleSimulationService = {
  /**
   * Simulate rule conditions against fatca_dataset
   * @param {Object} ruleData - Rule configuration
   * @param {Array} conditions - Rule conditions array
   * @returns {Object} Simulation results with matched/unmatched records
   */
  async simulateRule(ruleData, conditions) {
    if (useRestApi) {
      try {
        const payload = {
          organizationId: ruleData?.organizationId,
          ruleSetId: ruleData?.ruleSetId || null,
          reportingYear: ruleData?.reportingYear
        };
        const response = await apiClient?.post('/api/rules/simulate', payload);
        return response?.data || {
          success: true, matched_count: 0, unmatched_count: 0, total_count: 0,
          matched_records: [], unmatched_records: [], sample_matches: [],
          simulation_date: new Date()?.toISOString(), match_percentage: '0.00'
        };
      } catch (error) {
        console.error('Simulation error:', error?.message);
        return {
          success: false, error: error?.message || 'Simulation failed',
          matched_count: 0, unmatched_count: 0, total_count: 0,
          matched_records: [], unmatched_records: [], sample_matches: [],
          simulation_date: new Date()?.toISOString(), match_percentage: '0.00'
        };
      }
    }
    // Supabase local simulation fallback
    try {
      const { organizationId, regimeType, reportingYear } = ruleData;
      const { data: customerRecords, error: fetchError } = await supabase?.from('fatca_dataset')?.select('*')?.eq('organization_id', organizationId)?.eq('reporting_year', reportingYear)?.limit(1000);
      if (fetchError) throw new Error('Failed to fetch customer data for simulation');
      if (!customerRecords || customerRecords?.length === 0) {
        return {
          success: true, matched_count: 0, unmatched_count: 0, total_count: 0,
          matched_records: [], unmatched_records: [], sample_matches: [],
          simulation_date: new Date()?.toISOString(), message: 'No customer data available', match_percentage: '0.00'
        };
      }
      const matchedRecords = [];
      const unmatchedRecords = [];
      customerRecords?.forEach(record => {
        const isMatch = this.evaluateConditions(record, conditions, regimeType);
        const customerData = {
          id: record?.id, account_number: record?.account_number,
          account_holder_name: record?.account_holder_name, account_balance: record?.account_balance,
          country_code: record?.country_code, tax_id: record?.tax_id,
          customer_type: record?.account_data?.customer_type || 'UNKNOWN',
          regime_applicability: record?.account_data?.regime_applicability || 'UNKNOWN'
        };
        if (isMatch) matchedRecords?.push(customerData);
        else unmatchedRecords?.push(customerData);
      });
      const matchPercentage = customerRecords?.length > 0
        ? ((matchedRecords?.length / customerRecords?.length) * 100)?.toFixed(2) : '0.00';
      return {
        success: true, matched_count: matchedRecords?.length, unmatched_count: unmatchedRecords?.length,
        total_count: customerRecords?.length, matched_records: matchedRecords,
        unmatched_records: unmatchedRecords?.slice(0, 10), sample_matches: matchedRecords?.slice(0, 10),
        simulation_date: new Date()?.toISOString(), match_percentage: matchPercentage
      };
    } catch (error) {
      return {
        success: false, error: error?.message || 'Simulation failed',
        matched_count: 0, unmatched_count: 0, total_count: 0,
        matched_records: [], unmatched_records: [], sample_matches: [],
        simulation_date: new Date()?.toISOString(), match_percentage: '0.00'
      };
    }
  },

  /**
   * Evaluate if a record matches all rule conditions
   * @param {Object} record - Customer record from fatca_dataset
   * @param {Array} conditions - Rule conditions
   * @param {String} regimeType - FATCA or CRS
   * @returns {Boolean} True if record matches all conditions
   */
  evaluateConditions(record, conditions, regimeType) {
    if (!conditions || conditions?.length === 0) return false;
    const recordRegime = record?.account_data?.regime_applicability;
    if (regimeType === 'FATCA' && recordRegime !== 'FATCA' && recordRegime !== 'BOTH') return false;
    if (regimeType === 'CRS' && recordRegime !== 'CRS' && recordRegime !== 'BOTH') return false;
    return conditions?.every(condition => {
      const fieldValue = this.getFieldValue(record, condition?.field);
      return this.evaluateCondition(fieldValue, condition?.operator, condition?.value);
    });
  },

  /**
   * Get matched conditions for transparency
   * @param {Object} record - Customer record
   * @param {Array} conditions - Rule conditions
   * @returns {Array} Array of matched condition descriptions
   */
  getMatchedConditions(record, conditions) {
    return conditions?.filter(condition => {
      const fieldValue = this.getFieldValue(record, condition?.field);
      return this.evaluateCondition(fieldValue, condition?.operator, condition?.value);
    })?.map(condition => {
      const fieldValue = this.getFieldValue(record, condition?.field);
      return `${condition?.field} ${condition?.operator} ${condition?.value} (actual: ${fieldValue})`;
    });
  },

  /**
   * Get field value from record (supports nested paths)
   * @param {Object} record - Customer record
   * @param {String} fieldName - Field name or path (e.g., 'account_balance', 'account_data.customer_type')
   * @returns {*} Field value
   */
  getFieldValue(record, fieldName) {
    if (!fieldName) return null;
    const fieldMapping = {
      'customer_type': 'account_data.customer_type', 'account_balance': 'account_balance',
      'country_of_residence': 'country_code', 'tax_residency': 'country_code',
      'us_person': 'account_data.nationality', 'recalcitrant_status': 'account_data.recalcitrant_customer',
      'account_status': 'account_data.account_status', 'entity_type': 'account_data.customer_type',
      'fatca_status': 'account_data.regime_applicability', 'crs_status': 'account_data.regime_applicability',
      'segment': 'account_data.segment', 'product': 'account_data.product',
      'currency_code': 'account_data.currency_code', 'nationality': 'account_data.nationality',
      'city': 'account_data.city', 'state': 'account_data.state',
      'salary': 'account_data.salary', 'annual_income': 'account_data.annual_income',
      'profession': 'account_data.profession', 'Account Balance': 'account_balance',
      'Customer Type': 'account_data.customer_type'
    };
    const mappedField = fieldMapping?.[fieldName] || fieldName;
    if (mappedField?.includes('.')) {
      const parts = mappedField?.split('.');
      let value = record;
      for (const part of parts) {
        if (value === null || value === undefined) return null;
        value = value?.[part];
      }
      return value;
    }
    return record?.[mappedField];
  },

  /**
   * Evaluate a single condition
   * @param {*} fieldValue - Actual field value
   * @param {String} operator - Comparison operator
   * @param {*} conditionValue - Expected value
   * @returns {Boolean} True if condition matches
   */
  evaluateCondition(fieldValue, operator, conditionValue) {
    if (fieldValue === null || fieldValue === undefined) return false;
    const strFieldValue = String(fieldValue)?.toLowerCase()?.trim();
    const strConditionValue = String(conditionValue)?.toLowerCase()?.trim();
    switch (operator) {
      case 'equals': case '=': case '==': return strFieldValue === strConditionValue;
      case 'not_equals': case '!=': case '<>': return strFieldValue !== strConditionValue;
      case 'contains': return strFieldValue?.includes(strConditionValue);
      case 'not_contains': return !strFieldValue?.includes(strConditionValue);
      case 'starts_with': return strFieldValue?.startsWith(strConditionValue);
      case 'ends_with': return strFieldValue?.endsWith(strConditionValue);
      case 'greater_than': case '>': return parseFloat(fieldValue) > parseFloat(conditionValue);
      case 'less_than': case '<': return parseFloat(fieldValue) < parseFloat(conditionValue);
      case 'greater_than_or_equal': case '>=': return parseFloat(fieldValue) >= parseFloat(conditionValue);
      case 'less_than_or_equal': case '<=': return parseFloat(fieldValue) <= parseFloat(conditionValue);
      case 'in': return conditionValue?.split(',')?.map(v => v?.trim()?.toLowerCase())?.includes(strFieldValue);
      case 'not_in': return !conditionValue?.split(',')?.map(v => v?.trim()?.toLowerCase())?.includes(strFieldValue);
      case 'is_null': return fieldValue === null || fieldValue === undefined || strFieldValue === '';
      case 'is_not_null': return fieldValue !== null && fieldValue !== undefined && strFieldValue !== '';
      default: return strFieldValue === strConditionValue;
    }
  },

  /**
   * Get detailed failure reason for a condition
   * @param {*} actualValue - Actual field value
   * @param {String} operator - Comparison operator
   * @param {*} expectedValue - Expected value
   * @param {String} fieldName - Field name
   * @returns {String} Detailed failure reason
   */
  getFailureReason(actualValue, operator, expectedValue, fieldName) {
    const displayValue = actualValue === null || actualValue === undefined ? 'NULL' : actualValue;
    
    switch (operator) {
      case 'equals': case '=':
        return `${fieldName}: "${displayValue}" (Required: = "${expectedValue}")`;
      
      case 'not_equals': case '!=':
        return `${fieldName}: "${displayValue}" (Required: ≠ "${expectedValue}")`;
      
      case 'contains':
        return `${fieldName}: "${displayValue}" (Required: contains "${expectedValue}")`;
      
      case 'not_contains':
        return `${fieldName}: "${displayValue}" (Required: does not contain "${expectedValue}")`;
      
      case 'greater_than': case '>':
        return `${fieldName}: ${displayValue} (Required: > ${expectedValue})`;
      
      case 'less_than': case '<':
        return `${fieldName}: ${displayValue} (Required: < ${expectedValue})`;
      
      case 'greater_than_or_equal': case '>=':
        return `${fieldName}: ${displayValue} (Required: ≥ ${expectedValue})`;
      
      case 'less_than_or_equal': case '<=':
        return `${fieldName}: ${displayValue} (Required: ≤ ${expectedValue})`;
      
      case 'in':
        return `${fieldName}: "${displayValue}" (Required: one of [${expectedValue}])`;
      
      case 'not_in':
        return `${fieldName}: "${displayValue}" (Required: not in [${expectedValue}])`;
      
      case 'is_null':
        return `${fieldName}: "${displayValue}" (Required: NULL)`;
      
      case 'is_not_null':
        return `${fieldName}: NULL (Required: NOT NULL)`;
      
      case 'is_empty':
        return `${fieldName}: "${displayValue}" (Required: empty)`;
      
      case 'is_not_empty':
        return `${fieldName}: empty (Required: not empty)`;
      
      case 'starts_with':
        return `${fieldName}: "${displayValue}" (Required: starts with "${expectedValue}")`;
      
      case 'ends_with':
        return `${fieldName}: "${displayValue}" (Required: ends with "${expectedValue}")`;
      
      default:
        return `${fieldName}: "${displayValue}" does not match condition "${operator} ${expectedValue}"`;
    }
  },

  /**
   * Save simulation results to rule
   * @param {String} ruleId - Rule ID
   * @param {Object} simulationResults - Simulation results object
   */
  async saveSimulationResults(ruleId, simulationResults) {
    try {
      const { error } = await supabase
        ?.from('fatca_crs_rule_sets')
        ?.update({ simulation_results: simulationResults })
        ?.eq('id', ruleId);

      if (error) {
        console.error('Error saving simulation results:', error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving simulation results:', error);
      throw error;
    }
  },

  /**
   * Get simulation history for a rule
   * @param {String} ruleId - Rule ID
   * @returns {Object} Simulation results
   */
  async getSimulationResults(ruleId) {
    try {
      const { data, error } = await supabase
        ?.from('fatca_crs_rule_sets')
        ?.select('simulation_results')
        ?.eq('id', ruleId)
        ?.single();

      if (error) {
        console.error('Error fetching simulation results:', error);
        return null;
      }

      return data?.simulation_results || null;
    } catch (error) {
      console.error('Error fetching simulation results:', error);
      return null;
    }
  }
};