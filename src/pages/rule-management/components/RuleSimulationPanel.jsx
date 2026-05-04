import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RuleSimulationPanel = ({ simulationResults, onClose }) => {
  const [showUnmatched, setShowUnmatched] = useState(false);
  const [expandedConditions, setExpandedConditions] = useState({});

  const toggleCondition = (index) => {
    setExpandedConditions(prev => ({
      ...prev,
      [index]: !prev?.[index]
    }));
  };

  if (!simulationResults) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Icon name="Play" size={20} className="text-primary" />
            Simulation Results
          </h3>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              iconName="X"
              onClick={onClose}
            />
          )}
        </div>
        <div className="text-center py-8">
          <Icon name="AlertCircle" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No simulation results available</p>
          <p className="text-xs text-muted-foreground mt-1">Run a simulation to see results</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString)?.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })?.format(amount);
  };

  const formatFieldValue = (value) => {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'number') return value?.toLocaleString();
    return String(value);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Play" size={20} className="text-primary" />
          Simulation Results
        </h3>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            iconName="X"
            onClick={onClose}
          />
        )}
      </div>
      {/* Simulation Status */}
      <div className="mb-6">
        {simulationResults?.success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <Icon name="CheckCircle" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">Simulation Successful</p>
              <p className="text-xs text-green-700 mt-1">
                Last run: {formatDate(simulationResults?.simulation_date)}
                {simulationResults?.logic_operator && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 rounded text-green-800 font-medium">
                    {simulationResults?.logic_operator} Logic
                  </span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <Icon name="XCircle" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Simulation Failed</p>
              <p className="text-xs text-red-700 mt-1">
                {simulationResults?.error || 'Unknown error occurred'}
              </p>
            </div>
          </div>
        )}
      </div>
      {/* Simulation Stats */}
      {simulationResults?.success && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-background border border-border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{simulationResults?.matched_count || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Matched Records</p>
            </div>
            <div className="bg-background border border-border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{simulationResults?.unmatched_count || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Unmatched Records</p>
            </div>
            <div className="bg-background border border-border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{simulationResults?.total_count || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Records</p>
            </div>
            <div className="bg-background border border-border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-primary">{simulationResults?.match_percentage || 0}%</p>
              <p className="text-xs text-muted-foreground mt-1">Match Rate</p>
            </div>
          </div>

          {/* Condition Evaluation Step-by-Step */}
          {simulationResults?.condition_evaluations && simulationResults?.condition_evaluations?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="ListChecks" size={16} className="text-primary" />
                Condition Evaluation Details
                {simulationResults?.logic_operator && (
                  <span className="text-xs font-normal text-muted-foreground">
                    ({simulationResults?.logic_operator === 'AND' ? 'All conditions must pass' : 'At least one condition must pass'})
                  </span>
                )}
              </h4>
              <div className="space-y-3">
                {simulationResults?.condition_evaluations?.map((condEval, index) => {
                  const isExpanded = expandedConditions?.[index];
                  const passRate = condEval?.totalEvaluated > 0 
                    ? ((condEval?.passed?.length / condEval?.totalEvaluated) * 100)?.toFixed(1)
                    : '0.0';
                  
                  return (
                    <div key={index} className="bg-background border border-border rounded-lg overflow-hidden">
                      {/* Condition Header */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-muted-foreground">Condition {index + 1}</span>
                            <span className="text-sm font-mono text-foreground bg-muted px-2 py-0.5 rounded">
                              {condEval?.conditionText}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Icon name="CheckCircle" size={14} className="text-green-600" />
                              <span className="text-xs text-green-700 font-semibold">
                                {condEval?.passed?.length} Passed
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Icon name="XCircle" size={14} className="text-red-600" />
                              <span className="text-xs text-red-700 font-semibold">
                                {condEval?.failed?.length} Failed
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Pass Rate: <span className="font-semibold text-foreground">{passRate}%</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCondition(index)}
                          iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
                        >
                          {isExpanded ? 'Hide' : 'View'} Details
                        </Button>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-border p-4 bg-muted/30">
                          {/* Passed Records */}
                          {condEval?.passed?.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                                <Icon name="Check" size={12} className="text-green-600" />
                                Matched Records ({condEval?.passed?.length})
                              </h5>
                              <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead className="bg-green-100">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-green-800 font-semibold">Customer Name</th>
                                        <th className="px-3 py-2 text-left text-green-800 font-semibold">Account Number</th>
                                        <th className="px-3 py-2 text-left text-green-800 font-semibold">Field Value</th>
                                        <th className="px-3 py-2 text-left text-green-800 font-semibold">Result</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {condEval?.passed?.slice(0, 10)?.map((record, idx) => (
                                        <tr key={idx} className="border-t border-green-200">
                                          <td className="px-3 py-2 text-green-900">{record?.customerName}</td>
                                          <td className="px-3 py-2 text-green-900 font-mono">{record?.accountNumber}</td>
                                          <td className="px-3 py-2 text-green-900 font-semibold">{formatFieldValue(record?.fieldValue)}</td>
                                          <td className="px-3 py-2">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-200 text-green-800 rounded-full font-medium">
                                              <Icon name="Check" size={10} />
                                              Matched
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                {condEval?.passed?.length > 10 && (
                                  <div className="px-3 py-2 bg-green-100 text-center text-xs text-green-700">
                                    Showing 10 of {condEval?.passed?.length} matched records
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Failed Records */}
                          {condEval?.failed?.length > 0 && (
                            <div>
                              <h5 className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                                <Icon name="X" size={12} className="text-red-600" />
                                Failed Records ({condEval?.failed?.length})
                              </h5>
                              <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead className="bg-red-100">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-red-800 font-semibold">Customer Name</th>
                                        <th className="px-3 py-2 text-left text-red-800 font-semibold">Account Number</th>
                                        <th className="px-3 py-2 text-left text-red-800 font-semibold">Reason</th>
                                        <th className="px-3 py-2 text-left text-red-800 font-semibold">Result</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {condEval?.failed?.slice(0, 10)?.map((record, idx) => (
                                        <tr key={idx} className="border-t border-red-200">
                                          <td className="px-3 py-2 text-red-900">{record?.customerName}</td>
                                          <td className="px-3 py-2 text-red-900 font-mono">{record?.accountNumber}</td>
                                          <td className="px-3 py-2 text-red-900 font-medium">{record?.reason}</td>
                                          <td className="px-3 py-2">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-200 text-red-800 rounded-full font-medium">
                                              <Icon name="X" size={10} />
                                              Failed
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                {condEval?.failed?.length > 10 && (
                                  <div className="px-3 py-2 bg-red-100 text-center text-xs text-red-700">
                                    Showing 10 of {condEval?.failed?.length} failed records
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matched Records Section */}
          {simulationResults?.sample_matches && simulationResults?.sample_matches?.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Icon name="CheckCircle" size={16} className="text-green-600" />
                  Matched Records ({simulationResults?.sample_matches?.length} of {simulationResults?.matched_count})
                </h4>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {simulationResults?.sample_matches?.map((record, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-green-700 font-medium">Account Number:</span>
                        <p className="text-sm text-green-900 font-semibold">{record?.account_number}</p>
                      </div>
                      <div>
                        <span className="text-xs text-green-700 font-medium">Account Balance:</span>
                        <p className="text-sm text-green-900 font-semibold">
                          {formatCurrency(record?.account_balance)}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-xs text-green-700 font-medium">Account Holder:</span>
                        <p className="text-sm text-green-900">{record?.account_holder_name}</p>
                      </div>
                      <div>
                        <span className="text-xs text-green-700 font-medium">Country:</span>
                        <p className="text-sm text-green-900">{record?.country_code}</p>
                      </div>
                      <div>
                        <span className="text-xs text-green-700 font-medium">Customer Type:</span>
                        <p className="text-sm text-green-900">{record?.customer_type}</p>
                      </div>
                      <div>
                        <span className="text-xs text-green-700 font-medium">Segment:</span>
                        <p className="text-sm text-green-900">{record?.segment}</p>
                      </div>
                      <div>
                        <span className="text-xs text-green-700 font-medium">Product:</span>
                        <p className="text-sm text-green-900">{record?.product}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-xs text-green-700 font-medium">Regime Applicability:</span>
                        <p className="text-sm text-green-900">{record?.regime_applicability}</p>
                      </div>
                      {/* Matched Conditions */}
                      {record?.matched_conditions && record?.matched_conditions?.length > 0 && (
                        <div className="md:col-span-2 mt-2 pt-2 border-t border-green-300">
                          <span className="text-xs text-green-700 font-medium">Matched Conditions:</span>
                          <ul className="mt-1 space-y-1">
                            {record?.matched_conditions?.map((condition, idx) => (
                              <li key={idx} className="text-xs text-green-800 flex items-start gap-1">
                                <Icon name="Check" size={12} className="text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{condition}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {simulationResults?.matched_count > simulationResults?.sample_matches?.length && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Showing {simulationResults?.sample_matches?.length} of {simulationResults?.matched_count} matched records
                </p>
              )}
            </div>
          )}

          {/* Unmatched Records Section */}
          {simulationResults?.unmatched_records && simulationResults?.unmatched_records?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Icon name="XCircle" size={16} className="text-red-600" />
                  Unmatched Records ({simulationResults?.unmatched_records?.length} of {simulationResults?.unmatched_count})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUnmatched(!showUnmatched)}
                  iconName={showUnmatched ? "ChevronUp" : "ChevronDown"}
                >
                  {showUnmatched ? 'Hide' : 'Show'}
                </Button>
              </div>
              {showUnmatched && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {simulationResults?.unmatched_records?.map((record, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <span className="text-xs text-red-700 font-medium">Account Number:</span>
                          <p className="text-sm text-red-900 font-semibold">{record?.account_number}</p>
                        </div>
                        <div>
                          <span className="text-xs text-red-700 font-medium">Account Balance:</span>
                          <p className="text-sm text-red-900 font-semibold">
                            {formatCurrency(record?.account_balance)}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-xs text-red-700 font-medium">Account Holder:</span>
                          <p className="text-sm text-red-900">{record?.account_holder_name}</p>
                        </div>
                        <div>
                          <span className="text-xs text-red-700 font-medium">Country:</span>
                          <p className="text-sm text-red-900">{record?.country_code}</p>
                        </div>
                        <div>
                          <span className="text-xs text-red-700 font-medium">Customer Type:</span>
                          <p className="text-sm text-red-900">{record?.customer_type}</p>
                        </div>
                        <div>
                          <span className="text-xs text-red-700 font-medium">Segment:</span>
                          <p className="text-sm text-red-900">{record?.segment}</p>
                        </div>
                        <div>
                          <span className="text-xs text-red-700 font-medium">Product:</span>
                          <p className="text-sm text-red-900">{record?.product}</p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-xs text-red-700 font-medium">Regime Applicability:</span>
                          <p className="text-sm text-red-900">{record?.regime_applicability}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {simulationResults?.unmatched_count > simulationResults?.unmatched_records?.length && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Showing {simulationResults?.unmatched_records?.length} of {simulationResults?.unmatched_count} unmatched records
                </p>
              )}
            </div>
          )}

          {/* No Matches Message */}
          {simulationResults?.matched_count === 0 && simulationResults?.total_count > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <Icon name="AlertTriangle" size={24} className="text-yellow-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-yellow-800">No Matching Records Found</p>
              <p className="text-xs text-yellow-700 mt-1">
                None of the {simulationResults?.total_count} records matched the rule conditions. Consider adjusting your criteria.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RuleSimulationPanel;