import React, { useState } from 'react';
import { Upload, FileText, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { parseFile } from '../utils/fileParser';
import { reconcileTransactions, ReconciliationResult } from '../utils/reconciliation';

const formatDateUK = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const BankReconciliation: React.FC = () => {
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [accountsFile, setAccountsFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);


  const handleFileUpload = (file: File | null, type: 'bank' | 'accounts') => {
    if (type === 'bank') {
      setBankFile(file);
    } else {
      setAccountsFile(file);
    }
    setResult(null);
    setError(null);
  };

  const processReconciliation = async () => {
    if (!bankFile || !accountsFile) return;

    setProcessing(true);
    setError(null);
    setDebugLogs([]);

    try {
      const bankTransactions = await parseFile(bankFile);
      const accountTransactions = await parseFile(accountsFile);

      if (bankTransactions.length === 0) {
        throw new Error('No transactions found in bank file. Please check the file format.');
      }

      if (accountTransactions.length === 0) {
        throw new Error('No transactions found in accounts file. Please check the file format.');
      }

      const reconciliationResult = await reconcileTransactions(
        bankTransactions,
        accountTransactions,
        (log) => setDebugLogs(prev => [...prev, log])
      );
      setResult(reconciliationResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process reconciliation. Please try again.';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const downloadResults = () => {
    if (!result) return;

    const csvContent = generateCSV(result);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reconciliation-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCSV = (data: ReconciliationResult): string => {
    let csv = 'Type,Date,Description,Amount\n';

    csv += '\nMATCHED TRANSACTIONS\n';
    data.matched.forEach(item => {
      csv += `Matched,${formatDateUK(item.date)},"${item.description}",${item.bankAmount}\n`;
    });

    csv += '\nUNMATCHED BANK TRANSACTIONS\n';
    data.unmatched.bank.forEach(item => {
      csv += `Unmatched Bank,${formatDateUK(item.date)},"${item.description}",${item.amount}\n`;
    });

    csv += '\nUNMATCHED ACCOUNTS TRANSACTIONS\n';
    data.unmatched.accounts.forEach(item => {
      csv += `Unmatched Accounts,${formatDateUK(item.date)},"${item.description}",${item.amount}\n`;
    });

    return csv;
  };

  return (
    <div className="flex-1 flex flex-col bg-l1-background">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-l1-text-primary mb-2">Bank Reconciliation</h1>
            <p className="text-l1-text-secondary">
              Upload your bank statement and accounting system files to reconcile transactions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UploadZone
              title="Bank Statement"
              description="Upload CSV or Excel file from your bank"
              file={bankFile}
              onFileSelect={(file) => handleFileUpload(file, 'bank')}
            />
            <UploadZone
              title="Accounting System"
              description="Upload CSV or Excel file from your accounts"
              file={accountsFile}
              onFileSelect={(file) => handleFileUpload(file, 'accounts')}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <div className="font-medium text-red-500">Error</div>
                <div className="text-sm text-red-400 mt-1">{error}</div>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={processReconciliation}
              disabled={!bankFile || !accountsFile || processing}
              className="px-8 py-3 bg-l1-accent text-white rounded-lg font-medium hover:bg-l1-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  <span>Reconcile Transactions</span>
                </>
              )}
            </button>
          </div>

          {debugLogs.length > 0 && (
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 max-h-96 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Debug Logs</h3>
              <div className="space-y-1 font-mono text-xs">
                {debugLogs.map((log, idx) => (
                  <div key={idx} className="text-green-400">{log}</div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="bg-l1-surface rounded-lg border border-l1-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-l1-text-primary">Reconciliation Results</h2>
                  <button
                    onClick={downloadResults}
                    className="px-4 py-2 bg-l1-primary hover:bg-l1-accent/20 text-l1-text-primary rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Download size={18} />
                    <span>Download Report</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-500">{result.summary.totalMatched}</div>
                    <div className="text-sm text-l1-text-secondary mt-1">Matched Transactions</div>
                    <div className="text-lg font-semibold text-l1-text-primary mt-2">
                      ${result.summary.matchedAmount.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-yellow-500">{result.unmatched.bank.length}</div>
                    <div className="text-sm text-l1-text-secondary mt-1">Unmatched Bank</div>
                    <div className="text-lg font-semibold text-l1-text-primary mt-2">
                      ${result.summary.unmatchedBankAmount.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-500">{result.unmatched.accounts.length}</div>
                    <div className="text-sm text-l1-text-secondary mt-1">Unmatched Accounts</div>
                    <div className="text-lg font-semibold text-l1-text-primary mt-2">
                      ${result.summary.unmatchedAccountsAmount.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <ResultSection
                    title="Matched Transactions"
                    items={result.matched.map(item => ({
                      date: item.date,
                      description: item.description,
                      amount: item.bankAmount
                    }))}
                    type="success"
                  />
                  <ResultSection
                    title="Unmatched Bank Transactions"
                    items={result.unmatched.bank}
                    type="warning"
                  />
                  <ResultSection
                    title="Unmatched Accounting Transactions"
                    items={result.unmatched.accounts}
                    type="error"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface UploadZoneProps {
  title: string;
  description: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ title, description, file, onFileSelect }) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      onFileSelect(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="bg-l1-surface rounded-lg border border-l1-border p-6">
      <h3 className="text-lg font-semibold text-l1-text-primary mb-2">{title}</h3>
      <p className="text-sm text-l1-text-secondary mb-4">{description}</p>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-l1-border rounded-lg p-8 text-center hover:border-l1-accent/50 transition-colors cursor-pointer"
      >
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileInput}
          className="hidden"
          id={`file-${title}`}
        />
        <label htmlFor={`file-${title}`} className="cursor-pointer">
          {file ? (
            <div className="flex flex-col items-center space-y-3">
              <FileText className="text-l1-accent" size={48} />
              <div>
                <div className="font-medium text-l1-text-primary">{file.name}</div>
                <div className="text-sm text-l1-text-secondary mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onFileSelect(null);
                }}
                className="text-sm text-red-500 hover:text-red-400"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <Upload className="text-l1-text-secondary" size={48} />
              <div>
                <div className="font-medium text-l1-text-primary">Click to upload or drag and drop</div>
                <div className="text-sm text-l1-text-secondary mt-1">CSV or Excel files only</div>
              </div>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

interface ResultSectionProps {
  title: string;
  items: Array<{ date: string; description: string; amount: number }>;
  type: 'success' | 'warning' | 'error';
}

const ResultSection: React.FC<ResultSectionProps> = ({ title, items, type }) => {
  const [expanded, setExpanded] = useState(true);

  const colors = {
    success: 'border-green-500/30 bg-green-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    error: 'border-orange-500/30 bg-orange-500/5'
  };

  return (
    <div className={`border rounded-lg ${colors[type]}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-l1-primary/30 transition-colors"
      >
        <span className="font-semibold text-l1-text-primary">{title}</span>
        <span className="text-sm text-l1-text-secondary">{items.length} transactions</span>
      </button>
      {expanded && (
        <div className="border-t border-l1-border">
          {items.map((item, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-l1-primary/30 transition-colors">
              <div className="flex-1">
                <div className="font-medium text-l1-text-primary">{item.description}</div>
                <div className="text-sm text-l1-text-secondary mt-1">{formatDateUK(item.date)}</div>
              </div>
              <div className="text-lg font-semibold text-l1-text-primary">
                ${item.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
