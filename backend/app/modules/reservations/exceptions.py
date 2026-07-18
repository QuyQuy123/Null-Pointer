class ReservationNotFoundError(LookupError):
    """Không tìm thấy lượt giữ chỗ."""


class ReservationExpiredError(RuntimeError):
    """Lượt giữ chỗ đã hết hạn."""


class ReservationStateError(RuntimeError):
    """Trạng thái hiện tại không cho phép thao tác được yêu cầu."""
