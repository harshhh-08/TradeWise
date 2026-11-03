import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

function Home() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>TradeWise</h1>
      <p>Your educational stock-market learning and paper-trading platform.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
