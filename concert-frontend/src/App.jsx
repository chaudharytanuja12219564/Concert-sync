import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import CreateConcert from "./pages/CreateConcert";
import JoinConcert from "./pages/JoinConcert";
import Concert from "./pages/Concert";

function App() {
  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateConcert />} />
        <Route path="/join" element={<JoinConcert />} />
        <Route path="/concert/:inviteCode" element={<Concert />} />
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>

    </BrowserRouter>

  );
}

export default App;