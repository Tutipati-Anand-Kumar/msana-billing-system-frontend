import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Printer, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const DischargeSummary = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        // Patient Demographics
        patientName: '',
        age: '',
        gender: 'Male',
        address: '',
        phone: '',

        // Admission Details
        admissionDate: '',
        dischargeDate: '',
        ipNo: '',
        roomNo: '',
        department: '',

        // Medical Details
        consultantDoctor: '',
        diagnosis: '',
        chiefComplaints: '',
        historyOfPresentIllness: '',
        pastMedicalHistory: '',

        // Treatment
        treatmentGiven: '',
        surgicalProcedures: '',
        investigationsPerformed: '',

        // Discharge Details
        conditionAtDischarge: 'Stable',
        adviceOnDischarge: '',
        medicationsPrescribed: '',
        followUpInstructions: '',
        followUpDate: '',
        dietaryAdvice: '',
        activityRestrictions: '',
    });

    const handlePrint = () => {
        window.print();
    };

    const handleSave = async (shouldPrint = false) => {
        if (!formData.patientName || !formData.diagnosis) {
            toast.error('Please fill patient name and diagnosis');
            return;
        }

        setLoading(true);
        try {
            // Here you would save to database
            // For now, just show success
            toast.success('Discharge summary saved successfully!');

            if (shouldPrint) {
                setTimeout(() => window.print(), 500);
            }
        } catch (err) {
            toast.error('Failed to save discharge summary');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header - Hidden on Print */}
                <div className="mb-8 print:hidden">
                    <h1 className="text-3xl font-bold text-gray-900">Discharge Summary</h1>
                    <p className="text-gray-600 mt-2">Create patient discharge summary</p>
                </div>

                {/* Discharge Summary Container */}
                <div className="bg-white shadow-lg rounded-lg p-8 print:shadow-none print:rounded-none">
                    {/* Header */}
                    <div className="text-center border-b-2 border-blue-600 pb-4 mb-6">
                        <h2 className="text-2xl font-bold text-blue-700">DISCHARGE SUMMARY</h2>
                        <p className="text-sm text-gray-600 mt-2">Hospital Name / Medical Center</p>
                    </div>

                    {/* Patient Demographics - Form (Hidden on Print) */}
                    <div className="mb-6 print:hidden">
                        <h3 className="text-lg font-semibold mb-4 text-blue-700">Patient Demographics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
                                <input
                                    type="text"
                                    value={formData.patientName}
                                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                                <input
                                    type="text"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    className="input"
                                    placeholder="e.g., 45 years"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    className="input"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Admission Details - Form (Hidden on Print) */}
                    <div className="mb-6 print:hidden">
                        <h3 className="text-lg font-semibold mb-4 text-blue-700">Admission Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">IP No.</label>
                                <input
                                    type="text"
                                    value={formData.ipNo}
                                    onChange={(e) => setFormData({ ...formData, ipNo: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Room No.</label>
                                <input
                                    type="text"
                                    value={formData.roomNo}
                                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date</label>
                                <input
                                    type="datetime-local"
                                    value={formData.admissionDate}
                                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Discharge Date</label>
                                <input
                                    type="datetime-local"
                                    value={formData.dischargeDate}
                                    onChange={(e) => setFormData({ ...formData, dischargeDate: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                <input
                                    type="text"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Consultant Doctor</label>
                                <input
                                    type="text"
                                    value={formData.consultantDoctor}
                                    onChange={(e) => setFormData({ ...formData, consultantDoctor: e.target.value })}
                                    className="input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medical Details - Form (Hidden on Print) */}
                    <div className="mb-6 print:hidden">
                        <h3 className="text-lg font-semibold mb-4 text-blue-700">Medical Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis *</label>
                                <textarea
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                    rows="2"
                                    className="input"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Chief Complaints</label>
                                <textarea
                                    value={formData.chiefComplaints}
                                    onChange={(e) => setFormData({ ...formData, chiefComplaints: e.target.value })}
                                    rows="2"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">History of Present Illness</label>
                                <textarea
                                    value={formData.historyOfPresentIllness}
                                    onChange={(e) => setFormData({ ...formData, historyOfPresentIllness: e.target.value })}
                                    rows="3"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Past Medical History</label>
                                <textarea
                                    value={formData.pastMedicalHistory}
                                    onChange={(e) => setFormData({ ...formData, pastMedicalHistory: e.target.value })}
                                    rows="2"
                                    className="input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Treatment - Form (Hidden on Print) */}
                    <div className="mb-6 print:hidden">
                        <h3 className="text-lg font-semibold mb-4 text-blue-700">Treatment & Investigations</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Given</label>
                                <textarea
                                    value={formData.treatmentGiven}
                                    onChange={(e) => setFormData({ ...formData, treatmentGiven: e.target.value })}
                                    rows="3"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Surgical Procedures (if any)</label>
                                <textarea
                                    value={formData.surgicalProcedures}
                                    onChange={(e) => setFormData({ ...formData, surgicalProcedures: e.target.value })}
                                    rows="2"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Investigations Performed</label>
                                <textarea
                                    value={formData.investigationsPerformed}
                                    onChange={(e) => setFormData({ ...formData, investigationsPerformed: e.target.value })}
                                    rows="3"
                                    className="input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Discharge Details - Form (Hidden on Print) */}
                    <div className="mb-6 print:hidden">
                        <h3 className="text-lg font-semibold mb-4 text-blue-700">Discharge Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Condition at Discharge</label>
                                <select
                                    value={formData.conditionAtDischarge}
                                    onChange={(e) => setFormData({ ...formData, conditionAtDischarge: e.target.value })}
                                    className="input"
                                >
                                    <option value="Stable">Stable</option>
                                    <option value="Improved">Improved</option>
                                    <option value="Critical">Critical</option>
                                    <option value="Against Medical Advice">Against Medical Advice</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Medications Prescribed</label>
                                <textarea
                                    value={formData.medicationsPrescribed}
                                    onChange={(e) => setFormData({ ...formData, medicationsPrescribed: e.target.value })}
                                    rows="4"
                                    className="input"
                                    placeholder="List medications with dosage and duration"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Advice on Discharge</label>
                                <textarea
                                    value={formData.adviceOnDischarge}
                                    onChange={(e) => setFormData({ ...formData, adviceOnDischarge: e.target.value })}
                                    rows="3"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Advice</label>
                                <textarea
                                    value={formData.dietaryAdvice}
                                    onChange={(e) => setFormData({ ...formData, dietaryAdvice: e.target.value })}
                                    rows="2"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Restrictions</label>
                                <textarea
                                    value={formData.activityRestrictions}
                                    onChange={(e) => setFormData({ ...formData, activityRestrictions: e.target.value })}
                                    rows="2"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Instructions</label>
                                <textarea
                                    value={formData.followUpInstructions}
                                    onChange={(e) => setFormData({ ...formData, followUpInstructions: e.target.value })}
                                    rows="2"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                                <input
                                    type="date"
                                    value={formData.followUpDate}
                                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                                    className="input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Print View - Shown only on Print */}
                    <div className="hidden print:block space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div><strong>Patient Name:</strong> {formData.patientName}</div>
                            <div><strong>Age/Gender:</strong> {formData.age} / {formData.gender}</div>
                            <div><strong>IP No:</strong> {formData.ipNo}</div>
                            <div><strong>Room No:</strong> {formData.roomNo}</div>
                            <div><strong>Admission Date:</strong> {formData.admissionDate}</div>
                            <div><strong>Discharge Date:</strong> {formData.dischargeDate}</div>
                            <div className="col-span-2"><strong>Address:</strong> {formData.address}</div>
                            <div><strong>Department:</strong> {formData.department}</div>
                            <div><strong>Consultant:</strong> {formData.consultantDoctor}</div>
                        </div>

                        <div className="mt-4">
                            <h4 className="font-bold mb-2">DIAGNOSIS:</h4>
                            <p>{formData.diagnosis}</p>
                        </div>

                        <div>
                            <h4 className="font-bold mb-2">CHIEF COMPLAINTS:</h4>
                            <p>{formData.chiefComplaints}</p>
                        </div>

                        <div>
                            <h4 className="font-bold mb-2">HISTORY OF PRESENT ILLNESS:</h4>
                            <p>{formData.historyOfPresentIllness}</p>
                        </div>

                        <div>
                            <h4 className="font-bold mb-2">PAST MEDICAL HISTORY:</h4>
                            <p>{formData.pastMedicalHistory}</p>
                        </div>

                        <div>
                            <h4 className="font-bold mb-2">TREATMENT GIVEN:</h4>
                            <p>{formData.treatmentGiven}</p>
                        </div>

                        {formData.surgicalProcedures && (
                            <div>
                                <h4 className="font-bold mb-2">SURGICAL PROCEDURES:</h4>
                                <p>{formData.surgicalProcedures}</p>
                            </div>
                        )}

                        <div>
                            <h4 className="font-bold mb-2">INVESTIGATIONS PERFORMED:</h4>
                            <p>{formData.investigationsPerformed}</p>
                        </div>

                        <div>
                            <h4 className="font-bold mb-2">CONDITION AT DISCHARGE:</h4>
                            <p>{formData.conditionAtDischarge}</p>
                        </div>

                        <div>
                            <h4 className="font-bold mb-2">MEDICATIONS PRESCRIBED:</h4>
                            <p className="whitespace-pre-line">{formData.medicationsPrescribed}</p>
                        </div>

                        <div>
                            <h4 className="font-bold mb-2">ADVICE ON DISCHARGE:</h4>
                            <p>{formData.adviceOnDischarge}</p>
                        </div>

                        {formData.dietaryAdvice && (
                            <div>
                                <h4 className="font-bold mb-2">DIETARY ADVICE:</h4>
                                <p>{formData.dietaryAdvice}</p>
                            </div>
                        )}

                        {formData.activityRestrictions && (
                            <div>
                                <h4 className="font-bold mb-2">ACTIVITY RESTRICTIONS:</h4>
                                <p>{formData.activityRestrictions}</p>
                            </div>
                        )}

                        <div>
                            <h4 className="font-bold mb-2">FOLLOW-UP INSTRUCTIONS:</h4>
                            <p>{formData.followUpInstructions}</p>
                            {formData.followUpDate && <p className="mt-1"><strong>Follow-up Date:</strong> {formData.followUpDate}</p>}
                        </div>

                        <div className="mt-8 pt-4 border-t border-gray-300">
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-bold">Doctor's Signature</p>
                                    <p className="mt-8">_____________________</p>
                                    <p className="text-xs mt-1">{formData.consultantDoctor}</p>
                                </div>
                                <div>
                                    <p className="font-bold">Date</p>
                                    <p className="mt-8">_____________________</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Hidden on Print */}
                <div className="flex space-x-4 mt-6 print:hidden">
                    <button
                        onClick={() => handleSave(false)}
                        disabled={loading}
                        className="btn btn-secondary flex-1 flex items-center justify-center space-x-2"
                    >
                        <Save size={20} />
                        <span>{loading ? 'Saving...' : 'Save Only'}</span>
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={loading}
                        className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                    >
                        <Printer size={20} />
                        <span>{loading ? 'Saving...' : 'Save & Print'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DischargeSummary;
