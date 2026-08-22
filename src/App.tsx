import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import WikiHome from "./pages/WikiHome";
import ItemsPage from "./pages/ItemsPage";
import ItemDetail from "./pages/ItemDetail";
import NpcsPage from "./pages/NpcsPage";
import NpcDetail from "./pages/NpcDetail";
import BossesPage from "./pages/BossesPage";
import BossDetail from "./pages/BossDetail";
import MechanicsPage from "./pages/MechanicsPage";
import MechanicDetail from "./pages/MechanicDetail";
import SearchPage from "./pages/SearchPage";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="wiki" element={<WikiHome />} />
        <Route path="wiki/items" element={<ItemsPage />} />
        <Route path="wiki/items/:id" element={<ItemDetail />} />
        <Route path="wiki/npcs" element={<NpcsPage />} />
        <Route path="wiki/npcs/:id" element={<NpcDetail />} />
        <Route path="wiki/bosses" element={<BossesPage />} />
        <Route path="wiki/bosses/:id" element={<BossDetail />} />
        <Route path="wiki/mechanics" element={<MechanicsPage />} />
        <Route path="wiki/mechanics/:id" element={<MechanicDetail />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
