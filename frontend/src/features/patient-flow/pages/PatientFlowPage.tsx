import { useState } from "react";
import { DashboardScreen } from "../components/DashboardScreen";
import { NewPrescriptionScreen } from "../components/NewPrescriptionScreen";
import { PriorityScreen } from "../components/PriorityScreen";
import { RouteChoiceScreen } from "../components/RouteChoiceScreen";
import type { Priority, Route, ScheduleStrategy } from "../model/patient-flow.types";
import { RouteDetailScreen } from "../components/RouteDetailScreen";
import { ConfirmScreen } from "../components/ConfirmScreen";
import { TodayJourneyScreen } from "../components/TodayJourneyScreen";
import type { JourneyStep } from "../components/TodayJourneyScreen";
import { WaitingScreen } from "../components/WaitingScreen";
import { DirectionsScreen } from "../components/DirectionsScreen";
import { RouteChangeProposal } from "../components/RouteChangeProposal";
import { CompletionScreen } from "../components/CompletionScreen";
import { NavigationBar } from "../components/NavigationBar";
import type { NavTab } from "../components/NavigationBar";
import { NotificationsScreen } from "../components/NotificationsScreen";
import { SupportScreen } from "../components/SupportScreen";
import { JourneyOverviewScreen } from "../components/JourneyOverviewScreen";
import { MapScreen } from "../components/MapScreen";

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
  | "complete";

const isJourneyScreen = (screen: Screen) =>
  ["todayJourney", "waiting", "complete"].includes(screen);

export default function PatientFlowPage() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [priority, setPriority] = useState<Priority>("fastest");
  const [scheduleStrategy, setScheduleStrategy] = useState<ScheduleStrategy>("balanced");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [viewDetailRoute, setViewDetailRoute] = useState<Route | null>(null);
  const [journeyStep, setJourneyStep] = useState<JourneyStep>(0);
  const [activeTab, setActiveTab] = useState<NavTab>("today");
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

  // Tab overlay content
  function renderTabContent() {
    if (!isJourneyScreen(screen) && screen !== "directions") return null;
    if (activeTab === "notifications") return <NotificationsScreen />;
    if (activeTab === "support") return <SupportScreen onCallStaff={() => {}} />;
    if (activeTab === "journey" && currentRoute) {
      return <JourneyOverviewScreen route={currentRoute} currentStep={journeyStep} />;
    }
    return null;
  }

  const tabContent = renderTabContent();
  const showBottomNav = isJourneyScreen(screen) || screen === "directions";

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
            onStartJourney={(strategy) => {
              if (strategy) setScheduleStrategy(strategy);
              nav("newPrescription");
            }}
            onViewMap={() => nav("mapView")}
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
            onRequestSupport={() => nav("choosePriority")}
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
            scheduleStrategy={scheduleStrategy}
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
            onConfirmed={() => { setActiveTab("today"); nav("todayJourney"); }}
            onChooseAnother={() => nav("chooseRoute")}
          />
        )}

        {/* ── Journey screens with tab overlay ── */}
        {isJourneyScreen(screen) && tabContent ? (
          tabContent
        ) : (
          <>
            {screen === "todayJourney" && currentRoute && (
              <TodayJourneyScreen
                route={currentRoute}
                currentStep={journeyStep}
                onShowDirections={() => { setPrevScreen("todayJourney"); nav("directions"); }}
                onNeedSupport={() => { setActiveTab("support"); }}
                onStepDone={handleStepDone}
                onShowRouteChange={() => setShowRouteChange(true)}
              />
            )}

            {screen === "waiting" && currentRoute && (
              <WaitingScreen
                route={currentRoute}
                currentStep={journeyStep}
                onNext={() => nav("todayJourney")}
                onNeedSupport={() => setActiveTab("support")}
              />
            )}

            {screen === "directions" && (
              <DirectionsScreen
                destination={stepLocations[journeyStep]}
                floor={stepFloors[journeyStep]}
                distance={stepDistances[journeyStep]}
                onArrived={() => nav("waiting")}
                onNotFound={() => setActiveTab("support")}
                onBack={() => nav(prevScreen)}
              />
            )}

            {screen === "complete" && (
              <CompletionScreen
                onShowDirections={() => { setPrevScreen("complete"); nav("directions"); }}
              />
            )}
          </>
        )}
      </div>

      {/* Route change proposal overlay */}
      {showRouteChange && (
        <RouteChangeProposal
          onAccept={() => setShowRouteChange(false)}
          onDecline={() => setShowRouteChange(false)}
          onRequestSupport={() => { setShowRouteChange(false); setActiveTab("support"); }}
        />
      )}

      {/* Bottom navigation — only on journey screens */}
      {showBottomNav && (
        <NavigationBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === "today" && screen !== "todayJourney") nav("todayJourney");
          }}
          notificationCount={2}
        />
      )}
    </div>
  );
}
