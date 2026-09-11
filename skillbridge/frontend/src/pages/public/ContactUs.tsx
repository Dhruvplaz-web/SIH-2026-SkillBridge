import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, Phone, MapPin, Send, CheckCircle2, ArrowLeft, 
  Clock, Shield, Building2, HelpCircle 
} from 'lucide-react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export default function ContactUs() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'STUDENT',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 selection:bg-teal-500 selection:text-white font-sans">
      {/* Top Sovereign Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-green-600" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-900 to-slate-800 flex items-center justify-center text-white font-bold shadow-md shadow-slate-900/10 border border-slate-700">
              <span className="text-teal-400 font-serif text-lg"> सेतु </span>
            </div>
            <div>
              <span className="text-base font-bold text-gray-900 tracking-tight block">SkillSetu</span>
              <span className="text-[10px] text-gray-500 tracking-wider uppercase font-medium block">National Skill Harmonization Platform</span>
            </div>
          </Link>

          <Link to="/" className="btn-secondary text-xs flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto space-y-3">
          <Breadcrumbs className="text-slate-400" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold">
            <Mail className="w-4 h-4 text-teal-400" />
            National Stakeholder Support &amp; Grievance Redressal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Contact SkillSetu National Coordination Cell
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Get in touch with our institutional support desk, technical grievance cell, or enterprise partnership division.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Coordinates & Hours */}
          <div className="md:col-span-1 space-y-4 text-xs">
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>National Secretariat</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                SkillSetu National Coordination Cell<br />
                AICTE Headquarters Campus<br />
                Nelson Mandela Marg, Vasant Kunj<br />
                New Delhi, Delhi 110070, India
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                <Phone className="w-4 h-4 text-teal-600" />
                <span>Helpline &amp; Support</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                <strong>General Support:</strong> +91-11-29581000<br />
                <strong>Institutional Grievance:</strong> +91-11-29581015<br />
                <strong>Email:</strong> support@skillsetu.gov.in
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Operational Hours</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Monday &ndash; Friday: 09:00 &ndash; 18:00 IST<br />
                Closed on National &amp; Gazetted Holidays.<br />
                Cryptographic Ledger operates 24/7/365.
              </p>
            </div>
          </div>

          {/* Interactive Form */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Send an Official Communication</h3>
              <p className="text-xs text-gray-500 mb-6">
                Fill out the dispatch form below. Queries are acknowledged within 24 business hours with an official tracking ID.
              </p>

              {formSubmitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-950">Communication Dispatched Successfully!</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                    Thank you, <strong>{formData.name}</strong>. Your inquiry has been registered under Docket ID <strong>#SS-COMM-{Math.floor(100000 + Math.random() * 900000)}</strong>. Our national desk will follow up at <strong>{formData.email}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({ name: '', email: '', role: 'STUDENT', subject: '', message: '' });
                    }}
                    className="btn-secondary text-xs mt-2"
                  >
                    Send Another Dispatch
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Dr. Ramesh Gupta"
                        className="input w-full text-xs"
                      />
                    </div>

                    <div>
                      <label className="label">Official Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. ramesh@institution.edu.in"
                        className="input w-full text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Stakeholder Category *</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="input w-full text-xs cursor-pointer"
                      >
                        <option value="STUDENT">Student / Candidate</option>
                        <option value="RECRUITER">Corporate Enterprise Recruiter</option>
                        <option value="ACADEMICIAN">Academic Faculty / Dean</option>
                        <option value="REGULATOR">University / State DTE Representative</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">Subject / Purpose *</label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g. Institutional BoS Harmonization Onboarding"
                        className="input w-full text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Message / Details *</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please articulate your query, institutional affiliation, or technical assistance requirement..."
                      className="input w-full text-xs resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Shield className="w-3.5 h-3.5 text-teal-600" />
                      <span>Encrypted under DPDP Act 2023 statutory guidelines</span>
                    </div>

                    <button
                      type="submit"
                      className="btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmit Message</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
