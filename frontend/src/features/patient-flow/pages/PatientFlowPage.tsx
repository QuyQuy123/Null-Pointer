import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, RefreshCw } from "lucide-react";
import { useParams } from "react-router-dom";
import { DashboardScreen } from "../components/DashboardScreen";
import { NewPrescriptionScreen } from "../components/NewPrescriptionScreen";
import { PriorityScreen } from "../components/PriorityScreen";
import { RouteChoiceScreen } from "../components/RouteChoiceScreen";
import type { Priority, Route, RouteReservation, ScheduleStrategy } from "../model/patient-flow.types";
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
import { getLatestPatientOrder } from "../../../entities/clinical-order/api/clinical-order-api";
import {
  getLatestPatientReservation,
  mapClinicalOrderRoutes,
  updateJourneyProgress,
} from "../api/patient-flow-api";

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

interface PatientDataStateProps {
  patientCode: string;
  isLoading: boolean;
  onRetry: () => void;
}

function PatientDataState({ patientCode, isLoading, onRetry }: PatientDataStateProps) {
  return (
    <div className="relative bg-background min-h-[100dvh] max-w-[430px] mx-auto">
      <div className="bg-primary text-primary-foreground px-4 pt-10 pb-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <span style={{ fontSize: 15 }} className="text-white">Bệnh viện Đa khoa TW</span>
        </div>
        <p style={{ fontSize: 13, opacity: 0.8 }} className="text-white">Mã bệnh nhân</p>
        <h1 style={{ fontSize: 26 }} className="text-white mt-1">{patientCode}</h1>
      </div>
      <div className="px-4 -mt-4">
        <div className="bg-card rounded-2xl border border-border p-6 text-center shadow-sm">
          <RefreshCw size={28} className={`text-primary mx-auto mb-4 ${isLoading ? "animate-spin" : ""}`} />
          <h2 style={{ fontSize: 18 }} className="text-foreground">
            {isLoading ? "Đang tải dữ liệu lượt khám" : "Chưa có chỉ định mới"}
          </h2>
          <p style={{ fontSize: 14 }} className="text-muted-foreground mt-2 leading-relaxed">
            {isLoading
              ? "Hệ thống đang đọc chỉ định và lộ trình mới nhất từ bệnh viện."
              : "Màn hình sẽ tự cập nhật khi nhân viên gửi chỉ định cho bệnh nhân này."}
          </p>
          {!isLoading && (
            <button
              type="button"
              onClick={onRetry}
              className="w-full mt-5 py-3.5 rounded-xl bg-primary text-primary-foreground active:scale-[0.98] transition-all"
              style={{ minHeight: 50, fontSize: 15 }}
            >
              Kiểm tra lại ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PatientFlowPage() {
  const { patientCode } = useParams<{ patientCode: string }>();
  const patientOrderQuery = useQuery({
    queryKey: ["latest-patient-clinical-order", patientCode],
    queryFn: () => getLatestPatientOrder(patientCode ?? ""),
    enabled: Boolean(patientCode),
    retry: false,
    refetchInterval: 3_000,
  });
  const patientOrder = patientCode ? patientOrderQuery.data : undefined;
  const patientReservationQuery = useQuery({
    queryKey: ["latest-patient-reservation", patientCode, patientOrder?.id],
    queryFn: () => getLatestPatientReservation(patientCode ?? ""),
    enabled: Boolean(patientCode && patientOrder),
    retry: false,
    refetchOnWindowFocus: false,
  });
  const dispatchedRoutes = useMemo(
    () => (patientOrder ? mapClinicalOrderRoutes(patientOrder) : undefined),
    [patientOrder],
  );
  const [screen, setScreen] = useState<Screen>(() => patientCode ? "newPrescription" : "dashboard");
  const [priority, setPriority] = useState<Priority>("fastest");
  const [scheduleStrategy, setScheduleStrategy] = useState<ScheduleStrategy>("balanced");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [viewDetailRoute, setViewDetailRoute] = useState<Route | null>(null);
  const [journeyStep, setJourneyStep] = useState<JourneyStep>(0);
  const [activeTab, setActiveTab] = useState<NavTab>("today");
  const [prevScreen, setPrevScreen] = useState<Screen>("todayJourney");
  const [showRouteChange, setShowRouteChange] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(patientOrder?.id);
  const [activeReservation, setActiveReservation] = useState<RouteReservation | null>(null);
  const [journeySyncError, setJourneySyncError] = useState<string | null>(null);

  const loadedReservation = patientReservationQuery.data;
  const persistedReservation =
    loadedReservation &&
    loadedReservation.clinicalOrderId === patientOrder?.id &&
    loadedReservation.status === "confirmed"
      ? loadedReservation
      : undefined;
  const savedReservation = activeReservation ?? persistedReservation;
  const displayedJourneyStep = (savedReservation?.currentStep ?? journeyStep) as JourneyStep;
  const displayedScreen: Screen =
    screen === "newPrescription" && persistedReservation
      ? persistedReservation.journeyStatus === "completed"
        ? "complete"
        : "todayJourney"
      : screen;

  if (patientOrder && patientOrder.id !== activeOrderId) {
    setActiveOrderId(patientOrder.id);
    setSelectedRoute(null);
    setViewDetailRoute(null);
    setJourneyStep(0);
    setActiveReservation(null);
    setJourneySyncError(null);
    setActiveTab("today");
    setScreen("newPrescription");
  }

  function nav(s: Screen) {
    setScreen(s);
  }

  async function handleStepDone() {
    const next = (displayedJourneyStep + 1) as JourneyStep;
    const lastStepIndex = Math.max((currentRoute?.stepDetails.length ?? 1) - 1, 0);
    const reservation = savedReservation;
    setJourneySyncError(null);

    try {
      if (next > lastStepIndex) {
        if (reservation) {
          setActiveReservation(
            await updateJourneyProgress(
              reservation.id,
              lastStepIndex,
              "completed",
            ),
          );
        }
        setScreen("complete");
      } else {
        if (reservation) {
          setActiveReservation(
            await updateJourneyProgress(reservation.id, next, "active"),
          );
        }
        setJourneyStep(next);
      }
    } catch {
      setJourneySyncError(
        "Không lưu được tiến độ lên máy chủ. Vui lòng kiểm tra kết nối và thử lại.",
      );
    }
  }

  const restoredRoute = dispatchedRoutes?.find(
    (route) =>
      route.backendOptionId ===
      (activeReservation ?? persistedReservation)?.routeOptionId,
  );
  const currentRoute = selectedRoute ?? viewDetailRoute ?? restoredRoute;
  const navigationRoute = currentRoute ?? dispatchedRoutes?.[0];
  const currentStepDetail = navigationRoute?.stepDetails[displayedJourneyStep];
  const currentDestination = currentStepDetail?.roomName ?? "Điểm đến đang được cập nhật";
  const currentFloor = currentStepDetail?.floor ?? "Chưa có thông tin tầng";
  const currentDistance = currentStepDetail
    ? `Di chuyển dự kiến ${currentStepDetail.travelMinutes} phút`
    : "Đang tính quãng đường";

  // Tab overlay content
  function renderTabContent() {
    if (!isJourneyScreen(displayedScreen) && displayedScreen !== "directions") return null;
    if (activeTab === "notifications") return <NotificationsScreen />;
    if (activeTab === "support") return <SupportScreen onCallStaff={() => {}} />;
    if (activeTab === "journey" && currentRoute) {
      return <JourneyOverviewScreen route={currentRoute} currentStep={displayedJourneyStep} />;
    }
    return null;
  }

  const tabContent = renderTabContent();
  const showBottomNav = isJourneyScreen(displayedScreen) || displayedScreen === "directions";

  if (patientCode && !patientOrder) {
    return (
      <PatientDataState
        patientCode={patientCode}
        isLoading={patientOrderQuery.isPending}
        onRetry={() => patientOrderQuery.refetch()}
      />
    );
  }

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
        {journeySyncError && (
          <div
            role="alert"
            className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700"
            style={{ fontSize: 13 }}
          >
            {journeySyncError}
          </div>
        )}

        {/* ── Dashboard ── */}
        {displayedScreen === "dashboard" && (
          <DashboardScreen
            order={patientOrder}
            onStartJourney={(strategy) => {
              if (strategy) setScheduleStrategy(strategy);
              nav("newPrescription");
            }}
            onViewMap={() => nav("mapView")}
          />
        )}

        {/* ── Map screen ── */}
        {displayedScreen === "mapView" && (
          <MapScreen
            destination={currentDestination}
            floor={currentFloor}
            travelMinutes={currentStepDetail?.travelMinutes}
            onBack={() => nav("dashboard")}
          />
        )}

        {/* ── Setup flow ── */}
        {displayedScreen === "newPrescription" && (
          <NewPrescriptionScreen
            order={patientOrder}
            onBack={() => nav("dashboard")}
            onContinue={() => nav("choosePriority")}
            onRequestSupport={() => nav("choosePriority")}
          />
        )}

        {displayedScreen === "choosePriority" && (
          <PriorityScreen
            onBack={() => nav("newPrescription")}
            onContinue={(p) => { setPriority(p); nav("chooseRoute"); }}
            onUpdateAccessibility={() => {}}
          />
        )}

        {displayedScreen === "chooseRoute" && (
          <RouteChoiceScreen
            priority={priority}
            scheduleStrategy={scheduleStrategy}
            dispatchedRoutes={dispatchedRoutes}
            doctorName={patientOrder?.doctor_name}
            onBack={() => nav("choosePriority")}
            onSelect={(route) => { setSelectedRoute(route); nav("confirmReserve"); }}
            onViewDetail={(route) => { setViewDetailRoute(route); nav("routeDetail"); }}
          />
        )}

        {displayedScreen === "routeDetail" && viewDetailRoute && (
          <RouteDetailScreen
            route={viewDetailRoute}
            onBack={() => nav("chooseRoute")}
            onConfirm={(route) => { setSelectedRoute(route); nav("confirmReserve"); }}
          />
        )}

        {displayedScreen === "confirmReserve" && selectedRoute && (
          <ConfirmScreen
            route={selectedRoute}
            patientCode={patientOrder?.patient_code ?? patientCode ?? ""}
            clinicalOrderId={patientOrder?.id ?? ""}
            doctorName={patientOrder?.doctor_name}
            doctorRoomCode={patientOrder?.doctor_room_code}
            onBack={() => nav("chooseRoute")}
            onConfirmed={(reservation) => {
              setActiveReservation(reservation);
              setJourneyStep(reservation.currentStep as JourneyStep);
              setActiveTab("today");
              nav("todayJourney");
            }}
            onChooseAnother={() => nav("chooseRoute")}
          />
        )}

        {/* ── Journey screens with tab overlay ── */}
        {isJourneyScreen(displayedScreen) && tabContent ? (
          tabContent
        ) : (
          <>
            {displayedScreen === "todayJourney" && currentRoute && (
              <TodayJourneyScreen
                route={currentRoute}
                currentStep={displayedJourneyStep}
                onShowDirections={() => { setPrevScreen("todayJourney"); nav("directions"); }}
                onNeedSupport={() => { setActiveTab("support"); }}
                onStepDone={handleStepDone}
              />
            )}

            {displayedScreen === "waiting" && currentRoute && (
              <WaitingScreen
                route={currentRoute}
                currentStep={displayedJourneyStep}
                onNext={() => nav("todayJourney")}
                onNeedSupport={() => setActiveTab("support")}
              />
            )}

            {displayedScreen === "directions" && (
              <DirectionsScreen
                destination={currentDestination}
                roomCode={currentStepDetail?.roomCode}
                floor={currentFloor}
                distance={currentDistance}
                onArrived={() => nav("waiting")}
                onNotFound={() => setActiveTab("support")}
                onBack={() => nav(prevScreen)}
              />
            )}

            {displayedScreen === "complete" && (
              <CompletionScreen
                route={currentRoute ?? dispatchedRoutes?.[0]}
                doctorName={patientOrder?.doctor_name}
                doctorRoomCode={patientOrder?.doctor_room_code}
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
            if (tab === "today" && displayedScreen !== "todayJourney") nav("todayJourney");
          }}
          notificationCount={2}
        />
      )}
    </div>
  );
}
