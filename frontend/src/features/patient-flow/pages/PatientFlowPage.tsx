import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, RefreshCw } from "lucide-react";
import { useParams } from "react-router-dom";
import { DashboardScreen } from "../components/DashboardScreen";
import { NewPrescriptionScreen } from "../components/NewPrescriptionScreen";
import { PriorityScreen } from "../components/PriorityScreen";
import { RouteChoiceScreen } from "../components/RouteChoiceScreen";
import type { Route, RouteReservation, ScheduleStrategy } from "../model/patient-flow.types";
import { RouteDetailScreen } from "../components/RouteDetailScreen";
import { ConfirmScreen } from "../components/ConfirmScreen";
import { TodayJourneyScreen } from "../components/TodayJourneyScreen";
import type { JourneyStep } from "../components/TodayJourneyScreen";
import { DirectionsScreen } from "../components/DirectionsScreen";
import { CompletionScreen } from "../components/CompletionScreen";
import { NotificationsScreen } from "../components/NotificationsScreen";
import { MapScreen } from "../components/MapScreen";
import { getLatestPatientOrder } from "../../../entities/clinical-order/api/clinical-order-api";
import { getPatient } from "../../../entities/patient/api/patient-api";
import { getTodayPatientActivities } from "../../../entities/patient/api/patient-activity-api";
import type { PatientProfile } from "../../../entities/patient/model/patient.schemas";
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
  | "directions"
  | "notifications"
  | "complete";

interface PatientDataStateProps {
  patientCode: string;
  patient?: PatientProfile;
  isLoading: boolean;
  hasPatientError: boolean;
  onRetry: () => void;
}

interface MissingScreenDataProps {
  title: string;
  description: string;
  onRetry: () => void;
  onBack: () => void;
}

function MissingScreenData({
  title,
  description,
  onRetry,
  onBack,
}: MissingScreenDataProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background px-4 pb-8 pt-16">
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <RefreshCw size={28} className="mx-auto mb-4 text-primary" />
        <h1 className="text-foreground" style={{ fontSize: 20 }}>{title}</h1>
        <p className="mt-2 leading-relaxed text-muted-foreground" style={{ fontSize: 14 }}>
          {description}
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="w-full rounded-xl bg-primary py-3.5 text-primary-foreground"
            style={{ minHeight: 50, fontSize: 15 }}
          >
            Tải lại dữ liệu
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full rounded-xl border border-border bg-card py-3.5 text-foreground"
            style={{ minHeight: 48, fontSize: 15 }}
          >
            Quay lại màn hình chính
          </button>
        </div>
      </div>
    </div>
  );
}

function PatientDataState({
  patientCode,
  patient,
  isLoading,
  hasPatientError,
  onRetry,
}: PatientDataStateProps) {
  const title = hasPatientError
    ? "Không tìm thấy hồ sơ bệnh nhân"
    : isLoading
      ? "Đang tải dữ liệu lượt khám"
      : `Xin chào ${patient?.full_name ?? patientCode}`;
  const description = hasPatientError
    ? "Mã trong đường dẫn QR không tồn tại hoặc hồ sơ chưa được lưu trên máy chủ."
    : isLoading
      ? "Hệ thống đang đọc hồ sơ, chỉ định và lộ trình mới nhất từ bệnh viện."
      : "Chưa có chỉ định mới. Màn hình sẽ tự cập nhật khi nhân viên gửi chỉ định cho bạn.";

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
        <h1 style={{ fontSize: 26 }} className="text-white mt-1">
          {patient?.full_name ?? patientCode}
        </h1>
        {patient && (
          <p style={{ fontSize: 13, opacity: 0.85 }} className="text-white mt-1">
            {patient.id} · Lượt khám {patient.current_encounter_id}
          </p>
        )}
      </div>
      <div className="px-4 -mt-4">
        <div className="bg-card rounded-2xl border border-border p-6 text-center shadow-sm">
          <RefreshCw size={28} className={`text-primary mx-auto mb-4 ${isLoading ? "animate-spin" : ""}`} />
          <h2 style={{ fontSize: 18 }} className="text-foreground">
            {title}
          </h2>
          <p style={{ fontSize: 14 }} className="text-muted-foreground mt-2 leading-relaxed">
            {description}
          </p>
          {patient && !hasPatientError && (
            <div className="grid grid-cols-2 gap-2 mt-5 text-left">
              <div className="rounded-xl bg-muted p-3">
                <span style={{ fontSize: 11 }} className="text-muted-foreground">Bảo hiểm y tế</span>
                <strong style={{ fontSize: 13 }} className="block text-foreground mt-1">{patient.health_insurance_number}</strong>
              </div>
              <div className="rounded-xl bg-muted p-3">
                <span style={{ fontSize: 11 }} className="text-muted-foreground">Bác sĩ phụ trách</span>
                <strong style={{ fontSize: 13 }} className="block text-foreground mt-1">{patient.attending_doctor_name}</strong>
              </div>
            </div>
          )}
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
  const patientQuery = useQuery({
    queryKey: ["patient-profile", patientCode],
    queryFn: () => getPatient(patientCode ?? ""),
    enabled: Boolean(patientCode),
    retry: false,
    refetchOnWindowFocus: false,
  });
  const patientOrderQuery = useQuery({
    queryKey: ["latest-patient-clinical-order", patientCode],
    queryFn: () => getLatestPatientOrder(patientCode ?? ""),
    enabled: Boolean(patientCode),
    retry: false,
    refetchInterval: 3_000,
  });
  const patientActivitiesQuery = useQuery({
    queryKey: ["today-patient-activities", patientCode],
    queryFn: () => getTodayPatientActivities(patientCode ?? ""),
    enabled: Boolean(patientCode),
    retry: false,
    refetchInterval: 3_000,
  });
  const patientProfile = patientCode ? patientQuery.data : undefined;
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
  const [scheduleStrategy, setScheduleStrategy] = useState<ScheduleStrategy>("balanced");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [viewDetailRoute, setViewDetailRoute] = useState<Route | null>(null);
  const [journeyStep, setJourneyStep] = useState<JourneyStep>(0);
  const [prevScreen, setPrevScreen] = useState<Screen>("todayJourney");
  const [isRegeneratingJourney, setIsRegeneratingJourney] = useState(false);
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
    screen === "newPrescription" && persistedReservation && !isRegeneratingJourney
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
    setIsRegeneratingJourney(false);
    setScreen("newPrescription");
  }

  function nav(s: Screen) {
    setScreen(s);
  }

  async function handleStepDone() {
    const next = (displayedJourneyStep + 1) as JourneyStep;
    const displayedRoute = currentRoute ?? dispatchedRoutes?.[0];
    const lastStepIndex = Math.max((displayedRoute?.stepDetails.length ?? 1) - 1, 0);
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
  const previousStepDetail =
    displayedJourneyStep > 0
      ? navigationRoute?.stepDetails[displayedJourneyStep - 1]
      : undefined;
  const directionOrigin =
    previousStepDetail?.roomName ?? patientOrder?.doctor_room_code ?? "Vị trí hiện tại";
  const currentDestination = currentStepDetail?.roomName ?? "Điểm đến đang được cập nhật";
  const currentFloor = currentStepDetail?.floor ?? "Chưa có thông tin tầng";
  const currentDistance = currentStepDetail
    ? `Di chuyển dự kiến ${currentStepDetail.travelMinutes} phút`
    : "Đang tính quãng đường";

  const retryJourneyData = () => {
    void patientOrderQuery.refetch();
    void patientReservationQuery.refetch();
  };

  if (!patientCode) {
    return (
      <PatientDataState
        patientCode="Không xác định"
        isLoading={false}
        hasPatientError
        onRetry={() => undefined}
      />
    );
  }

  if (!patientProfile || !patientOrder) {
    return (
      <PatientDataState
        patientCode={patientCode}
        patient={patientProfile}
        isLoading={patientQuery.isPending || patientOrderQuery.isPending}
        hasPatientError={patientQuery.isError}
        onRetry={() => {
          void patientQuery.refetch();
          void patientOrderQuery.refetch();
        }}
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
            activities={patientActivitiesQuery.data ?? []}
            isActivitiesLoading={patientActivitiesQuery.isPending}
            hasActivitiesError={patientActivitiesQuery.isError}
            onRetryActivities={() => {
              void patientActivitiesQuery.refetch();
            }}
            scheduleStrategy={scheduleStrategy}
            currentStep={displayedJourneyStep}
            routeOptionId={navigationRoute?.backendOptionId}
            onRegenerateJourney={(strategy) => {
              setScheduleStrategy(strategy);
              setIsRegeneratingJourney(true);
              nav("chooseRoute");
            }}
            onCompleteCurrentService={handleStepDone}
            onViewMap={() => nav("mapView")}
            onOpenNotifications={() => nav("notifications")}
          />
        )}

        {/* ── Map screen ── */}
        {displayedScreen === "mapView" && (
          <MapScreen
            key={currentStepDetail?.id ?? `${currentDestination}-${currentFloor}`}
            destination={currentDestination}
            floor={currentFloor}
            travelMinutes={currentStepDetail?.travelMinutes ?? 0}
            onServiceCompleted={handleStepDone}
            onBack={() => nav("dashboard")}
          />
        )}

        {/* ── Setup flow ── */}
        {displayedScreen === "newPrescription" && (
          <NewPrescriptionScreen
            order={patientOrder}
            onBack={() => {
              setIsRegeneratingJourney(false);
              nav("dashboard");
            }}
            onContinue={() => nav("choosePriority")}
          />
        )}

        {displayedScreen === "choosePriority" && (
          <PriorityScreen
            onBack={() => nav("newPrescription")}
            scheduleStrategy={scheduleStrategy}
            onContinue={(strategy) => {
              setScheduleStrategy(strategy);
              nav("chooseRoute");
            }}
          />
        )}

        {displayedScreen === "chooseRoute" && (
          <RouteChoiceScreen
            priority="system"
            scheduleStrategy={scheduleStrategy}
            dispatchedRoutes={dispatchedRoutes ?? []}
            recalculation={{
              patientCode: patientOrder.patient_code,
              completedServiceCodes: isRegeneratingJourney
                ? (
                    navigationRoute?.stepDetails
                      .slice(0, displayedJourneyStep)
                      .map((step) => step.serviceCode)
                      .filter((serviceCode) => serviceCode !== "doctor_return")
                    ?? []
                  )
                : [],
              startRoomCode: isRegeneratingJourney
                ? previousStepDetail?.roomCode ?? patientOrder.doctor_room_code
                : patientOrder.doctor_room_code,
            }}
            doctorName={patientOrder.doctor_name}
            onBack={() => {
              if (isRegeneratingJourney) {
                setIsRegeneratingJourney(false);
                nav("dashboard");
                return;
              }
              nav("choosePriority");
            }}
            onSelect={(route) => { setSelectedRoute(route); nav("confirmReserve"); }}
            onViewDetail={(route) => { setViewDetailRoute(route); nav("routeDetail"); }}
          />
        )}

        {displayedScreen === "routeDetail" && (
          viewDetailRoute ? (
            <RouteDetailScreen
              route={viewDetailRoute}
              onBack={() => nav("chooseRoute")}
              onConfirm={(route) => { setSelectedRoute(route); nav("confirmReserve"); }}
            />
          ) : (
            <MissingScreenData
              title="Lộ trình không còn khả dụng"
              description="Dữ liệu chi tiết đã thay đổi. Hãy tải lại danh sách phương án trước khi tiếp tục."
              onRetry={() => nav("chooseRoute")}
              onBack={() => nav("dashboard")}
            />
          )
        )}

        {displayedScreen === "confirmReserve" && (
          selectedRoute ? (
            <ConfirmScreen
              route={selectedRoute}
              patientCode={patientOrder?.patient_code ?? patientCode ?? ""}
              clinicalOrderId={patientOrder?.id ?? ""}
              doctorName={patientOrder.doctor_name}
              doctorRoomCode={patientOrder.doctor_room_code}
              onBack={() => nav("chooseRoute")}
              onConfirmed={(reservation) => {
                setIsRegeneratingJourney(false);
                setActiveReservation(reservation);
                setJourneyStep(reservation.currentStep as JourneyStep);
                void patientOrderQuery.refetch();
                nav("todayJourney");
              }}
              onChooseAnother={() => nav("chooseRoute")}
            />
          ) : (
            <MissingScreenData
              title="Chưa có lộ trình để xác nhận"
              description="Phương án đã chọn không còn trong bộ nhớ. Hãy chọn lại một lộ trình hợp lệ."
              onRetry={() => nav("chooseRoute")}
              onBack={() => nav("dashboard")}
            />
          )
        )}

        {displayedScreen === "todayJourney" && (
          navigationRoute ? (
            <TodayJourneyScreen
              route={navigationRoute}
              currentStep={displayedJourneyStep}
              onShowDirections={() => { setPrevScreen("todayJourney"); nav("directions"); }}
              onStepDone={handleStepDone}
            />
          ) : (
            <MissingScreenData
              title="Chưa tải được hành trình"
              description="Hệ thống chưa tìm thấy lộ trình đã xác nhận. Bạn có thể tải lại dữ liệu hoặc quay về màn hình chính."
              onRetry={retryJourneyData}
              onBack={() => nav("dashboard")}
            />
          )
        )}

        {displayedScreen === "directions" && (
          <DirectionsScreen
            origin={directionOrigin}
            destination={currentDestination}
            roomCode={currentStepDetail?.roomCode}
            floor={currentFloor}
            distance={currentDistance}
            onServiceCompleted={handleStepDone}
            onBack={() => nav(prevScreen)}
          />
        )}

        {displayedScreen === "complete" && (
          navigationRoute ? (
            <CompletionScreen
              route={navigationRoute}
              doctorName={patientOrder.doctor_name}
              onBackToDashboard={() => nav("dashboard")}
            />
          ) : (
            <MissingScreenData
              title="Chưa tải được kết quả hành trình"
              description="Dữ liệu lộ trình hoàn tất chưa đồng bộ. Hãy tải lại trước khi tiếp tục."
              onRetry={retryJourneyData}
              onBack={() => nav("dashboard")}
            />
          )
        )}

        {displayedScreen === "notifications" && (
          <NotificationsScreen
            activities={patientActivitiesQuery.data ?? []}
            isLoading={patientActivitiesQuery.isPending}
            hasError={patientActivitiesQuery.isError}
            onRetry={() => void patientActivitiesQuery.refetch()}
            onBack={() => nav("dashboard")}
          />
        )}
      </div>
    </div>
  );
}
