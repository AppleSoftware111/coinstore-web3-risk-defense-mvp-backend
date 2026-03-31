export class RpcError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "RpcError";
  }
}

export class CircuitOpenError extends Error {
  constructor(message = "RPC circuit breaker open") {
    super(message);
    this.name = "CircuitOpenError";
  }
}

export class TimeoutError extends Error {
  constructor(message = "RPC request timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}
