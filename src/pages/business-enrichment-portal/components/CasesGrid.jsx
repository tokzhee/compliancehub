import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CasesGrid = ({ cases, onEnrichData, onMarkReady }) => {
  const getCompletenessColor = (status) => {
    switch (status) {
      case 'Complete':
        return 'text-green-600 bg-green-50';
      case 'Missing TIN':
        return 'text-orange-600 bg-orange-50';
      case 'Missing Tax Residency':
        return 'text-yellow-600 bg-yellow-50';
      case 'Missing Classification':
        return 'text-blue-600 bg-blue-50';
      case 'Multiple Issues':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCaseStatusColor = (status) => {
    switch (status) {
      case 'Incomplete':
        return 'text-red-600 bg-red-50';
      case 'Under Enrichment':
        return 'text-blue-600 bg-blue-50';
      case 'Ready for Review':
        return 'text-green-600 bg-green-50';
      case 'Approved':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!cases || cases?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Icon name="Inbox" className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-lg">No cases assigned to your team</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Account Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Segment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Completeness
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cases?.map((caseItem) => (
                <tr key={caseItem?.id} className="hover:bg-muted/30 transition-all duration-200 hover:shadow-sm">
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {caseItem?.customer_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {caseItem?.customer_id}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">
                    {caseItem?.account_number}
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {caseItem?.fatca_crs_dataset_batch?.segment_giin_configuration?.segment_name || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {caseItem?.fatca_crs_dataset_batch?.segment_giin_configuration?.giin || 'No GIIN'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-foreground">
                    ${caseItem?.account_balance?.toLocaleString() || '0'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCompletenessColor(caseItem?.completeness_status)}`}>
                      {caseItem?.completeness_status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCaseStatusColor(caseItem?.case_status)}`}>
                      {caseItem?.case_status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      caseItem?.priority === 'High' ? 'text-red-600 bg-red-50' :
                      caseItem?.priority === 'Medium'? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50'
                    }`}>
                      {caseItem?.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEnrichData(caseItem)}
                        disabled={caseItem?.case_status === 'Ready for Review' || caseItem?.case_status === 'Approved'}
                      >
                        <Icon name="Edit" className="w-4 h-4 mr-1" />
                        Enrich
                      </Button>
                      {caseItem?.case_status === 'Under Enrichment' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onMarkReady(caseItem?.id)}
                        >
                          <Icon name="CheckCircle" className="w-4 h-4 mr-1" />
                          Mark Ready
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {cases?.map((caseItem) => (
          <div key={caseItem?.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {caseItem?.customer_name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {caseItem?.account_number}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCaseStatusColor(caseItem?.case_status)}`}>
                {caseItem?.case_status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Segment</p>
                <p className="text-sm font-medium text-foreground">
                  {caseItem?.fatca_crs_dataset_batch?.segment_giin_configuration?.segment_name || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {caseItem?.fatca_crs_dataset_batch?.segment_giin_configuration?.giin || 'No GIIN'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="text-sm font-medium text-foreground">
                  ${caseItem?.account_balance?.toLocaleString() || '0'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Priority</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                  caseItem?.priority === 'High' ? 'text-red-600 bg-red-50' :
                  caseItem?.priority === 'Medium'? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50'
                }`}>
                  {caseItem?.priority}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completeness</p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCompletenessColor(caseItem?.completeness_status)}`}>
                  {caseItem?.completeness_status}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEnrichData(caseItem)}
                disabled={caseItem?.case_status === 'Ready for Review' || caseItem?.case_status === 'Approved'}
                className="flex-1"
              >
                <Icon name="Edit" className="w-4 h-4 mr-1" />
                Enrich Data
              </Button>
              {caseItem?.case_status === 'Under Enrichment' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onMarkReady(caseItem?.id)}
                  className="flex-1"
                >
                  <Icon name="CheckCircle" className="w-4 h-4 mr-1" />
                  Mark Ready
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CasesGrid;