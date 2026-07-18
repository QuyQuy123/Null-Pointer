class ClinicalServiceNotFoundError(LookupError):
    pass


class ClinicalServiceConflictError(RuntimeError):
    pass
