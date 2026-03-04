import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AI_Home_Page from './components/AI_Home_Page';
import LegacyApp from './components/LegacyApp';
import HomeButton from './components/HomeButton';
import AI_Chart_Analysis_Modal from './components/AI_Chart_Analysis_Modal';
import Historical_Diagnostic_List_View from './components/Historical_Diagnostic_List_View';
import Archive_Detail_View from './components/Archive_Detail_View';
import AI_Chat_History_View from './components/AI_Chat_History_View';
import Offline_Knowledge_Base_View from './components/Offline_Knowledge_Base_View';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AI_Home_Page />} />
        <Route path="/legacy-dashboard" element={<LegacyApp />} />
        <Route path="/historical-diagnosis" element={<Historical_Diagnostic_List_View />} />
        <Route path="/archive-detail/:id" element={<Archive_Detail_View />} />
        <Route path="/chat-history" element={<AI_Chat_History_View />} />
        <Route path="/knowledge-base" element={<Offline_Knowledge_Base_View />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <HomeButton />
      <AI_Chart_Analysis_Modal />
    </Router>
  );
}

export default App;
