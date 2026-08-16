import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Mail, Copy, Check } from 'lucide-react';
import { useDataStore } from '@/store/dataStore';
import { useToast } from './ui/Toast';

export function EmailPreviewModal() {
  const navigate = useNavigate();
  const { emails } = useDataStore();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const latestEmail = emails[0];

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-email-preview', handler);
    return () => window.removeEventListener('open-email-preview', handler);
  }, []);

  const handleCopy = () => {
    if (!latestEmail) return;
    navigator.clipboard.writeText(`Subject: ${latestEmail.subject}\n\n${latestEmail.body}`);
    setCopied(true);
    toast.success('Email content copied');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!latestEmail) return null;

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="Email Preview"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button onClick={() => { setOpen(false); navigate('/notifications'); }}>Close</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-500/20">
            <Mail className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">To: {latestEmail.toName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{latestEmail.to}</p>
          </div>
        </div>
        <div>
          <p className="label">Subject</p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{latestEmail.subject}</p>
        </div>
        <div>
          <p className="label">Body</p>
          <div className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {latestEmail.body}
          </div>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          This is a simulated email. No real email was sent. Connect an email provider to enable delivery.
        </p>
      </div>
    </Modal>
  );
}

export function openEmailPreview() {
  window.dispatchEvent(new Event('open-email-preview'));
}
