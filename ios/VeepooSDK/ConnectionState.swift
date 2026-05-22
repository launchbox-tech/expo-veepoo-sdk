import Foundation

// MARK: - 连接状态枚举
enum ConnectionState {
  case idle, scanning, connecting, connected, discoveringServices
  case authenticating, ready, disconnecting, disconnected
  case error(String)

  var rawValue: String {
    switch self {
    case .idle: return "idle"
    case .scanning: return "scanning"
    case .connecting: return "connecting"
    case .connected: return "connected"
    case .discoveringServices: return "discoveringServices"
    case .authenticating: return "authenticating"
    case .ready: return "ready"
    case .disconnecting: return "disconnecting"
    case .disconnected: return "disconnected"
    case .error: return "error"
    }
  }
}
