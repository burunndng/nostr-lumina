import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import Index from "./pages/Index";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";
import { CuratorDashboard } from "./pages/CuratorDashboard";
import { BrowseLists } from "./pages/BrowseLists";
import { ListDetail } from "./pages/ListDetail";
import { FollowingFeed } from "./pages/FollowingFeed";
import { CuratorProfile } from "./pages/CuratorProfile";
import { ContentPreferences } from "./pages/ContentPreferences";
import { RelayStatusPage } from "./pages/RelayStatusPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/curate" element={<CuratorDashboard />} />
        <Route path="/lists" element={<BrowseLists />} />
        <Route path="/following" element={<FollowingFeed />} />
        <Route path="/profile/:npub" element={<CuratorProfile />} />
        <Route path="/list/:pubkey/:id" element={<ListDetail />} />
        <Route path="/settings/preferences" element={<ContentPreferences />} />
        <Route path="/settings/relays" element={<RelayStatusPage />} />
        {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
        <Route path="/:nip19" element={<NIP19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;
