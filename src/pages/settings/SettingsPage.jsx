import { useEffect, useState } from 'react';
import { settingsApi } from '../../services/settings.service.js';
import { academicYearApi } from '../../services/academicYear.service.js';
import { Card } from '../../components/Card.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Input } from '../../components/Input.jsx';
import { Button } from '../../components/Button.jsx';
import { Badge } from '../../components/Badge.jsx';
import { useToast } from '../../hooks/useToast.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { getErrorMessage } from '../../services/api.js';
import { formatDate } from '../../utils/format.js';

const EDITABLE_KEYS = [
  { key: 'institution_name', label: 'Institution Name' },
  { key: 'institution_phone', label: 'Institution Phone' },
  { key: 'institution_address', label: 'Institution Address' },
];

export default function SettingsPage() {
  const toast = useToast();
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = useState({});
  const [academicYears, setAcademicYears] = useState([]);
  const [saving, setSaving] = useState('');

  async function load() {
    const [s, ay] = await Promise.all([settingsApi.getAll(), academicYearApi.list()]);
    setSettings(s.data.data);
    setAcademicYears(ay.data.data);
  }
  useEffect(() => { load(); }, []);

  async function saveField(key) {
    setSaving(key);
    try {
      await settingsApi.update(key, settings[key]);
      await refreshSettings();
      toast.success('Settings updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving('');
    }
  }

  async function toggleOverpayment() {
    const newValue = settings.allow_overpayment === 'true' ? 'false' : 'true';
    setSaving('allow_overpayment');
    try {
      await settingsApi.update('allow_overpayment', newValue);
      setSettings((s) => ({ ...s, allow_overpayment: newValue }));
      await refreshSettings();
      toast.success('Settings updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving('');
    }
  }

  return (
    <div>
      <PageHeader title="Settings" description="Institution branding and system configuration" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <p className="font-semibold text-navy-900 mb-4">Institution Details</p>
          <div className="space-y-4">
            {EDITABLE_KEYS.map(({ key, label }) => (
              <div key={key} className="flex items-end gap-2">
                <Input
                  label={label}
                  className="flex-1"
                  value={settings[key] || ''}
                  onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                />
                <Button variant="secondary" loading={saving === key} onClick={() => saveField(key)}>Save</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="font-semibold text-navy-900 mb-4">Payment Rules</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Allow Overpayment</p>
              <p className="text-xs text-slate-400">If enabled, accountants can record payments exceeding the current due.</p>
            </div>
            <button
              onClick={toggleOverpayment}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${settings.allow_overpayment === 'true' ? 'bg-brand-600' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.allow_overpayment === 'true' ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <p className="font-semibold text-navy-900 mb-4">Academic Years</p>
          <div className="space-y-2">
            {academicYears.map((y) => (
              <div key={y.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{y.year_label}</p>
                  <p className="text-xs text-slate-400">{formatDate(y.start_date)} – {formatDate(y.end_date)}</p>
                </div>
                {y.is_current ? <Badge color="green">Current</Badge> : <Badge color="gray">Inactive</Badge>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
