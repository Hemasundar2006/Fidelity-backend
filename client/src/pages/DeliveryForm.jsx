import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Baby, Plus, Trash2, CheckCircle, QrCode, FileText } from 'lucide-react';

const DeliveryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [deliveryData, setDeliveryData] = useState({
    admittedAt: '',
    deliveredAt: '',
    type: 'normal',
    complications: '',
    bloodLossMl: '',
    maternalOutcome: 'Stable'
  });

  const [babies, setBabies] = useState([
    { id: 1, sex: 'female', birthWeightKg: '', birthLengthCm: '', headCircCm: '', apgar1: '', apgar5: '', gestationWeeks: '39', bloodGroup: '' }
  ]);

  const addBaby = () => {
    setBabies([...babies, { id: Date.now(), sex: '', birthWeightKg: '', birthLengthCm: '', headCircCm: '', apgar1: '', apgar5: '', gestationWeeks: deliveryData.gestationWeeks || '39', bloodGroup: '' }]);
  };

  const removeBaby = (idToRemove) => {
    if (babies.length > 1) {
      setBabies(babies.filter(b => b.id !== idToRemove));
    }
  };

  const updateBaby = (id, field, value) => {
    setBabies(babies.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate transaction delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessData({
        deliveryId: 'DEL-2027-0042',
        babies: babies.map((b, i) => ({
          babyId: `BBY-2027-0000${i + 1}`,
          name: `Baby of Lakshmi (${b.sex})`,
          qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BBY-2027-0000${i + 1}`
        })),
        guardianAccount: {
          email: 'lakshmi@example.com',
          tempPassword: 'Fidelity2027!'
        }
      });
    }, 2000);
  };

  if (successData) {
    return (
      <div className="max-w-3xl mx-auto mt-8">
        <div className="card text-center p-8">
          <div className="w-16 h-16 bg-success-light text-success rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-2xl font-heading font-semibold text-blue-800 mb-2">Delivery Recorded Successfully</h1>
          <p className="text-ink-600 mb-8 text-sm">The pregnancy status has been updated and baby profiles created.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
            {successData.babies.map((baby, idx) => (
              <div key={idx} className="card bg-ink-50 border border-ink-200">
                <div className="flex items-start gap-4 mb-4">
                  <QrCode size={48} className="text-blue-600 shrink-0" />
                  <div>
                    <h3 className="m-0 mb-1 text-base font-semibold text-blue-800">{baby.babyId}</h3>
                    <p className="text-sm text-ink-600 m-0">{baby.name}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-ink-200">
                  <span className="text-xs text-ink-600">Vaccination Schedule Generated</span>
                  <button 
                    className="btn btn-primary text-xs py-1.5 px-3"
                    onClick={() => navigate(`/babies/${baby.babyId}`)}
                  >
                    View Health Card
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50/50 border border-blue-600/30 p-5 rounded-card text-left mb-6">
            <h4 className="text-blue-800 font-semibold text-sm mb-2">Guardian Portal Access Provisioned</h4>
            <p className="text-sm text-ink-600 m-0"><strong>Login ID:</strong> {successData.guardianAccount.email}</p>
            <p className="text-sm text-ink-600 m-0 mt-1">
              <strong>Temporary Password:</strong> <span className="font-mono bg-white px-2 py-0.5 rounded border border-ink-200 text-xs">{successData.guardianAccount.tempPassword}</span>
            </p>
            <p className="text-xs text-ink-600 mt-2">Please share these credentials securely with the mother/guardian.</p>
          </div>

          <button className="btn btn-outline" onClick={() => navigate(`/patients/${id || 'MOM-2026-000001'}`)}>
            Return to Mother's Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-blue-800">Record Delivery</h1>
          <p className="text-[18px] max-sm:text-[16px] leading-[26px] text-ink-600 m-0">Log birth transaction for {id || 'MOM-2026-000001'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Maternal Delivery Details */}
        <div className="card">
          <h3 className="text-base font-semibold text-blue-800 mb-4 flex items-center gap-2 border-b border-ink-200 pb-2">
            <FileText size={18} className="text-blue-600" /> Maternal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Admitted At</label>
              <input type="datetime-local" className="input max-sm:h-[48px] max-sm:text-[16px]" required value={deliveryData.admittedAt} onChange={e => setDeliveryData({...deliveryData, admittedAt: e.target.value})} />
            </div>
            <div>
              <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Delivered At</label>
              <input type="datetime-local" className="input max-sm:h-[48px] max-sm:text-[16px]" required value={deliveryData.deliveredAt} onChange={e => setDeliveryData({...deliveryData, deliveredAt: e.target.value})} />
            </div>
            <div>
              <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Delivery Type</label>
              <select className="input max-sm:h-[48px] max-sm:text-[16px]" value={deliveryData.type} onChange={e => setDeliveryData({...deliveryData, type: e.target.value})}>
                <option value="normal">Normal Vaginal Delivery (NVD)</option>
                <option value="c_section">Caesarean Section (C-Section)</option>
                <option value="assisted">Assisted (Forceps/Vacuum)</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Estimated Blood Loss (ml)</label>
              <input type="number" className="input max-sm:h-[48px] max-sm:text-[16px]" placeholder="e.g. 450" value={deliveryData.bloodLossMl} onChange={e => setDeliveryData({...deliveryData, bloodLossMl: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Complications (if any)</label>
              <input type="text" className="input max-sm:h-[48px] max-sm:text-[16px]" placeholder="e.g. PPH, Fetal Distress" value={deliveryData.complications} onChange={e => setDeliveryData({...deliveryData, complications: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Newborn Details */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-heading font-semibold text-blue-800 m-0">Newborn Details</h2>
          <button type="button" className="btn btn-outline" onClick={addBaby}>
            <Plus size={16} /> Add Multiple Birth (Twin/Triplet)
          </button>
        </div>

        {babies.map((baby, index) => (
          <div key={baby.id} className="card border-l-4 border-l-pink-500">
            <div className="flex justify-between items-center border-b border-ink-200 pb-2 mb-4">
              <h3 className="m-0 text-base font-semibold text-blue-800 flex items-center gap-2">
                <Baby size={18} className="text-pink-500" /> Baby {index + 1}
              </h3>
              {babies.length > 1 && (
                <button type="button" className="p-1.5 rounded-card text-danger hover:bg-danger-light transition-colors" onClick={() => removeBaby(baby.id)} title="Remove Baby">
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Sex</label>
                <select className="input max-sm:h-[48px] max-sm:text-[16px]" required value={baby.sex} onChange={e => updateBaby(baby.id, 'sex', e.target.value)}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Gestation (Wks)</label>
                <input type="number" className="input max-sm:h-[48px] max-sm:text-[16px]" required value={baby.gestationWeeks} onChange={e => updateBaby(baby.id, 'gestationWeeks', e.target.value)} />
              </div>
              <div>
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Blood Group</label>
                <select className="input max-sm:h-[48px] max-sm:text-[16px]" value={baby.bloodGroup} onChange={e => updateBaby(baby.id, 'bloodGroup', e.target.value)}>
                  <option value="">Select</option>
                  <option>A+</option><option>B+</option><option>O+</option><option>AB+</option><option>Unknown</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Birth Weight (kg)</label>
                <input type="number" step="0.01" className="input max-sm:h-[48px] max-sm:text-[16px]" required placeholder="3.2" value={baby.birthWeightKg} onChange={e => updateBaby(baby.id, 'birthWeightKg', e.target.value)} />
              </div>

              <div>
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Length (cm)</label>
                <input type="number" className="input max-sm:h-[48px] max-sm:text-[16px]" required placeholder="50" value={baby.birthLengthCm} onChange={e => updateBaby(baby.id, 'birthLengthCm', e.target.value)} />
              </div>
              <div>
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">Head Circ. (cm)</label>
                <input type="number" className="input max-sm:h-[48px] max-sm:text-[16px]" placeholder="34" value={baby.headCircCm} onChange={e => updateBaby(baby.id, 'headCircCm', e.target.value)} />
              </div>
              <div>
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">APGAR (1 min)</label>
                <input type="number" min="0" max="10" className="input max-sm:h-[48px] max-sm:text-[16px]" required placeholder="8" value={baby.apgar1} onChange={e => updateBaby(baby.id, 'apgar1', e.target.value)} />
              </div>
              <div>
                <label className="text-[12px] leading-[16px] uppercase tracking-[0.06em] font-semibold text-ink-600">APGAR (5 min)</label>
                <input type="number" min="0" max="10" className="input max-sm:h-[48px] max-sm:text-[16px]" required placeholder="9" value={baby.apgar5} onChange={e => updateBaby(baby.id, 'apgar5', e.target.value)} />
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end mt-4">
          <button type="submit" className="btn btn-primary bg-success hover:bg-success-dark px-8 py-3 text-base shadow-card" disabled={isSubmitting}>
            {isSubmitting ? 'Processing Transaction...' : 'Record Birth & Create Baby Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryForm;
