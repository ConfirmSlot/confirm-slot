import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { C } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';

export default function BranchSelection() {
  const { spId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const { bookingType, date, time, tokenDate, sp } = state || {};
  const branches = sp?.business?.branches || sp?.buisness?.branches || [];

  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  if (!sp || branches.length === 0) {
    const dest = bookingType === 'session' ? `/sp/${spId}/session` : `/sp/${spId}/appointment`;
    navigate(dest, { state: { date, time }, replace: true });
    return null;
  }

  const selectedBranch = branches.find(b => b._id === selectedBranchId);

  const handleContinue = () => {
    const emp = selectedBranch?.employees?.find(e => e._id === selectedEmployeeId);
    const branchState = {
      branchId:           selectedBranchId || undefined,
      branchName:         selectedBranch?.name || '',
      branchPhone:        selectedBranch?.phoneNo || '',
      branchAddressLine1: selectedBranch?.addressLine1 || '',
      branchCity:         selectedBranch?.city || '',
      branchState:        selectedBranch?.state || '',
      branchPincode:      selectedBranch?.pincode || '',
      employeeId:         selectedEmployeeId || undefined,
      employeeName:       emp?.name || '',
    };

    if (bookingType === 'token') {
      // Go back to SP profile — it will call handleBookToken with branch params
      navigate(`/sp/${spId}`, { state: { resumeTokenBranch: true, tokenDate, ...branchState } });
    } else if (bookingType === 'session') {
      navigate(`/sp/${spId}/session`, { state: { ...branchState } });
    } else {
      navigate(`/sp/${spId}/appointment`, { state: { date, time, ...branchState } });
    }
  };

  return (
    <AppLayout title="Select Branch">
      <div style={{ padding: '16px', paddingBottom: 100 }}>

        <p style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: C.TEXT1 }}>
          Available Branches <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(Optional)</span>
        </p>

        {/* No preference */}
        <BranchOption
          selected={selectedBranchId === ''}
          onSelect={() => { setSelectedBranchId(''); setSelectedEmployeeId(''); }}
          primary
        >
          <p style={{ margin: 0, fontWeight: 700, color: selectedBranchId === '' ? C.PRIMARY : C.TEXT1 }}>No Preference</p>
        </BranchOption>

        {/* Branch list */}
        {branches.map(branch => {
          const isSel = selectedBranchId === branch._id;
          const loc = [branch.addressLine1, branch.city, branch.state].filter(Boolean).join(', ');
          return (
            <BranchOption key={branch._id} selected={isSel}
              onSelect={() => { setSelectedBranchId(branch._id); setSelectedEmployeeId(''); }}>
              <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 15, color: isSel ? C.PRIMARY : C.TEXT1 }}>
                {branch.name}
              </p>
              {branch.phoneNo && <p style={{ margin: '0 0 2px', fontSize: 13, color: '#6B7280' }}>{branch.phoneNo}</p>}
              {loc && <p style={{ margin: '0 0 2px', fontSize: 12, color: '#6B7280' }}>📍 {loc}</p>}
              {branch.employees?.length > 0 && (
                <p style={{ margin: 0, fontSize: 12, color: C.PRIMARY }}>
                  👤 {branch.employees.length} employee{branch.employees.length > 1 ? 's' : ''} available
                </p>
              )}
            </BranchOption>
          );
        })}

        {/* Employee selection */}
        {selectedBranch && selectedBranch.employees?.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <p style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: C.TEXT1 }}>
              Select Employee <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(Optional)</span>
            </p>

            <BranchOption selected={selectedEmployeeId === ''} onSelect={() => setSelectedEmployeeId('')} primary>
              <p style={{ margin: 0, fontWeight: 700, color: selectedEmployeeId === '' ? C.PRIMARY : C.TEXT1 }}>No Preference</p>
            </BranchOption>

            {selectedBranch.employees.map(emp => {
              const isSel = selectedEmployeeId === emp._id;
              return (
                <BranchOption key={emp._id} selected={isSel} onSelect={() => setSelectedEmployeeId(emp._id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${C.PRIMARY}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontWeight: 700, color: C.PRIMARY, fontSize: 15 }}>{emp.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: isSel ? C.PRIMARY : C.TEXT1 }}>{emp.name}</p>
                  </div>
                </BranchOption>
              );
            })}
          </div>
        )}
      </div>

      <div style={s.bottomBar}>
        <button onClick={handleContinue} style={s.continueBtn}>Continue</button>
      </div>
    </AppLayout>
  );
}

function BranchOption({ selected, onSelect, children }) {
  return (
    <div onClick={onSelect} style={{
      ...s.option,
      borderColor: selected ? C.PRIMARY : C.BORDER,
      backgroundColor: selected ? `${C.PRIMARY}12` : '#fff',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 11, border: `2px solid ${selected ? C.PRIMARY : '#D1D5DB'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 12,
      }}>
        {selected && <div style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: C.PRIMARY }} />}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

const s = {
  option: {
    display: 'flex', alignItems: 'center', padding: '14px 16px', borderRadius: 12,
    border: '2px solid', marginBottom: 10, cursor: 'pointer',
  },
  bottomBar: {
    position: 'fixed', bottom: 64, left: 0, right: 0,
    padding: '12px 16px', backgroundColor: '#fff', borderTop: `1px solid ${C.BORDER}`, zIndex: 90,
  },
  continueBtn: {
    width: '100%', padding: 15, borderRadius: 14, backgroundColor: C.PRIMARY,
    color: '#fff', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer',
  },
};
