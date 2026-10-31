import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout.jsx';
import InquiryPage from './pages/InquiryPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Admin routes (login and dashboard) are added in Batch 4.
export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<InquiryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
