class NoFeasibleRouteError(RuntimeError):
    """Không thể tạo lộ trình bao phủ đầy đủ chỉ định với phòng đang hoạt động."""


class RouteProposalNotFoundError(LookupError):
    """Không tìm thấy đề xuất lộ trình trong bộ nhớ ngắn hạn."""


class RouteProposalExpiredError(RuntimeError):
    """Đề xuất đã quá hạn và không còn được dùng để giữ chỗ."""


class RouteOptionNotFoundError(LookupError):
    """Phương án không thuộc đề xuất lộ trình đã cung cấp."""
