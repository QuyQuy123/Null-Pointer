import { useState } from "react";
import { DashboardScreen } from "./components/DashboardScreen";
import { NewPrescriptionScreen } from "./components/NewPrescriptionScreen";
import { PriorityScreen } from "./components/PriorityScreen";
import type { Priority } from "./components/PriorityScreen";
import { RouteChoiceScreen } from "./components/RouteChoiceScreen";
import type { Route } from "./components/RouteChoiceScreen";
import { RouteDetailScreen } from "./components/RouteDetailScreen";
import { ConfirmScreen } from "./components/ConfirmScreen";
import { TodayJourneyScreen } from "./components/TodayJourneyScreen";
import type { JourneyStep } from "./components/TodayJourneyScreen";
import { WaitingScreen } from "./components/WaitingScreen";
import { DirectionsScreen } from "./components/DirectionsScreen";
import { RouteChangeProposal } from "./components/RouteChangeProposal";
import { CompletionScreen } from "./components/CompletionScreen";
import { NotificationsScreen } from "./components/NotificationsScreen";
import { MapScreen } from "./components/MapScreen";

type Screen =
  | "dashboard"
  | "mapView"
  | "newPrescription"
  | "choosePriority"
  | "chooseRoute"
  | "routeDetail"
  | "confirmReserve"
  | "todayJourney"
  | "waiting"
  | "directions"
  | "notifications"
  | "complete";

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [priority, setPriority] = useState<Priority>("fastest");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [viewDetailRoute, setViewDetailRoute] = useState<Route | null>(null);
  const [journeyStep, setJourneyStep] = useState<JourneyStep>(0);
  const [prevScreen, setPrevScreen] = useState<Screen>("todayJourney");
  const [showRouteChange, setShowRouteChange] = useState(false);

  function nav(s: Screen) {
    setScreen(s);
  }

  function handleStepDone() {
    const next = (journeyStep + 1) as JourneyStep;
    if (next > 3) {
      setScreen("complete");
    } else {
      setJourneyStep(next);
    }
  }

  const stepLocations = ["Lấy máu 01", "X-quang 03", "Siêu âm 05", "Phòng khám Tim mạch 205"];
  const stepFloors = ["Tầng 1, khu A", "Tầng 2, khu A", "Tầng 2, khu A", "Tầng 2, khu A"];
  const stepDistances = ["Điểm xuất phát", "Cách 120 m", "Cách 80 m", "Cách 150 m"];

  const currentRoute = selectedRoute ?? viewDetailRoute;

  return (
    <div
      className="relative bg-background"
      style={{
        width: "100%",
        maxWidth: 430,
        minHeight: "100dvh",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>

        {/* ── Dashboard ── */}
        {screen === "dashboard" && (
          <DashboardScreen
            onStartJourney={() => nav("newPrescription")}
            onViewMap={() => nav("mapView")}
            onOpenNotifications={() => nav("notifications")}
          />
        )}

        {/* ── Map screen ── */}
        {screen === "mapView" && (
          <MapScreen onBack={() => nav("dashboard")} />
        )}

        {/* ── Setup flow ── */}
        {screen === "newPrescription" && (
          <NewPrescriptionScreen
            onBack={() => nav("dashboard")}
            onContinue={() => nav("choosePriority")}
          />
        )}

        {screen === "choosePriority" && (
          <PriorityScreen
            onBack={() => nav("newPrescription")}
            onContinue={(p) => { setPriority(p); nav("chooseRoute"); }}
            onUpdateAccessibility={() => {}}
          />
        )}

        {screen === "chooseRoute" && (
          <RouteChoiceScreen
            priority={priority}
            onBack={() => nav("choosePriority")}
            onSelect={(route) => { setSelectedRoute(route); nav("confirmReserve"); }}
            onViewDetail={(route) => { setViewDetailRoute(route); nav("routeDetail"); }}
          />
        )}

        {screen === "routeDetail" && viewDetailRoute && (
          <RouteDetailScreen
            route={viewDetailRoute}
            onBack={() => nav("chooseRoute")}
            onConfirm={(route) => { setSelectedRoute(route); nav("confirmReserve"); }}
          />
        )}

        {screen === "confirmReserve" && selectedRoute && (
          <ConfirmScreen
            route={selectedRoute}
            onBack={() => nav("chooseRoute")}
            onConfirmed={() => nav("todayJourney")}
            onChooseAnother={() => nav("chooseRoute")}
          />
        )}

        {screen === "todayJourney" && currentRoute && (
          <TodayJourneyScreen
            route={currentRoute}
            currentStep={journeyStep}
            onShowDirections={() => { setPrevScreen("todayJourney"); nav("directions"); }}
            onStepDone={handleStepDone}
            onShowRouteChange={() => setShowRouteChange(true)}
          />
        )}

        {screen === "waiting" && currentRoute && (
          <WaitingScreen
            route={currentRoute}
            currentStep={journeyStep}
            onNext={() => nav("todayJourney")}
          />
        )}

        {screen === "directions" && (
          <DirectionsScreen
            destination={stepLocations[journeyStep]}
            floor={stepFloors[journeyStep]}
            distance={stepDistances[journeyStep]}
            onArrived={() => nav("waiting")}
            onBack={() => nav(prevScreen)}
          />
        )}

        {screen === "complete" && (
          <CompletionScreen
            onShowDirections={() => { setPrevScreen("complete"); nav("directions"); }}
          />
        )}

        {screen === "notifications" && (
          <NotificationsScreen onBack={() => nav("dashboard")} />
        )}
      </div>

      {/* Route change proposal overlay */}
      {showRouteChange && (
        <RouteChangeProposal
          onAccept={() => setShowRouteChange(false)}
          onDecline={() => setShowRouteChange(false)}
        />
      )}
    </div>
  );
}
