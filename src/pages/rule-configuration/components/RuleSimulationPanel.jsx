import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const RuleSimulationPanel = ({ selectedRule, onSimulate }) => {
  const [simulationParams, setSimulationParams] = useState({
    reportingYear: '2026',
    sampleSize: '1000'
  });

  const [simulationResults, setSimulationResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const reportingYearOptions = [
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' }
  ];

  const sampleSizeOptions = [
    { value: '100', label: '100 records' },
    { value: '500', label: '500 records' },
    { value: '1000', label: '1,000 records' },
    { value: '5000', label: '5,000 records' }
  ];

  const handleSimulate = async () => {
    setIsSimulating(true);
    
    setTimeout(() => {
      const mockResults = {
        totalRecords: parseInt(simulationParams?.sampleSize),
        matchedRecords: Math.floor(parseInt(simulationParams?.sampleSize) * 0.23),
        reportableAccounts: Math.floor(parseInt(simulationParams?.sampleSize) * 0.18),
        executionTime: '2.3s',
        timestamp: new Date()?.toLocaleString()
      };
      
      setSimulationResults(mockResults);
      setIsSimulating(false);
      
      if (onSimulate) {
        onSimulate(selectedRule, simulationParams, mockResults);
      }
    }, 2000);
  };

  if (!selectedRule) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 md:p-8 text-center">
        <Icon name="Play" size={48} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Rule Selected</h3>
        <p className="text-sm text-muted-foreground">
          Select a rule from the table to run simulation
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
          <Icon name="Play" size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Rule Simulation</h3>
          <p className="text-sm text-muted-foreground">Test rule against sample dataset</p>
        </div>
      </div>
      <div className="bg-muted/30 rounded-lg border border-border p-4 mb-6">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Selected Rule</p>
            <p className="text-sm text-muted-foreground">{selectedRule?.ruleName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Version {selectedRule?.version} • {selectedRule?.ruleType}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-4 mb-6">
        <Select
          label="Reporting Year"
          options={reportingYearOptions}
          value={simulationParams?.reportingYear}
          onChange={(value) => setSimulationParams(prev => ({ ...prev, reportingYear: value }))}
        />

        <Select
          label="Sample Size"
          options={sampleSizeOptions}
          value={simulationParams?.sampleSize}
          onChange={(value) => setSimulationParams(prev => ({ ...prev, sampleSize: value }))}
        />
      </div>
      <Button
        variant="default"
        fullWidth
        iconName="Play"
        iconPosition="left"
        loading={isSimulating}
        onClick={handleSimulate}
      >
        {isSimulating ? 'Running Simulation...' : 'Run Simulation'}
      </Button>
      {simulationResults && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Icon name="CheckCircle2" size={20} className="text-success" />
            <h4 className="text-base font-semibold text-foreground">Simulation Results</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Total Records</p>
              <p className="text-2xl font-bold text-foreground">
                {simulationResults?.totalRecords?.toLocaleString()}
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Matched Records</p>
              <p className="text-2xl font-bold text-primary">
                {simulationResults?.matchedRecords?.toLocaleString()}
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Reportable Accounts</p>
              <p className="text-2xl font-bold text-success">
                {simulationResults?.reportableAccounts?.toLocaleString()}
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Execution Time</p>
              <p className="text-2xl font-bold text-foreground">
                {simulationResults?.executionTime}
              </p>
            </div>
          </div>

          <div className="bg-success/10 rounded-lg p-4 border border-success/20">
            <div className="flex items-start gap-3">
              <Icon name="CheckCircle2" size={20} className="text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-success mb-1">Simulation Completed</p>
                <p className="text-xs text-muted-foreground">
                  Executed at {simulationResults?.timestamp}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RuleSimulationPanel;