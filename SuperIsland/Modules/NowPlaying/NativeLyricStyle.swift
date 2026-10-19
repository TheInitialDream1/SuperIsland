import Foundation

/// Independent native adaptations for the compact island. No Folia runtime,
/// source code, fonts, artwork or models are bundled in these implementations.
enum NativeLyricStyle: String, CaseIterable, Identifiable {
    case standard, luminous, mindscape, staircase, floating, chorus, tilt
    case orbit, diorama, clockwork, sonnet, tempera, lumiere, monet, still

    var id: String { rawValue }

    var title: String {
        switch self {
        case .standard: return "原版"
        case .luminous: return "流光"
        case .mindscape: return "心象"
        case .staircase: return "云阶"
        case .floating: return "浮名"
        case .chorus: return "群唱"
        case .tilt: return "倾诉"
        case .orbit: return "回环"
        case .diorama: return "镜台"
        case .clockwork: return "时计"
        case .sonnet: return "商籁"
        case .tempera: return "凝彩"
        case .lumiere: return "绘光"
        case .monet: return "莫奈"
        case .still: return "静止"
        }
    }

    var description: String {
        switch self {
        case .standard: return "原有的左封面、右侧四行歌词和独立进度条"
        case .luminous: return "居中逐字歌词、流动专辑色背景和底部胶囊播放器"
        case .mindscape: return "全画布字云与焦点光圈，歌曲信息收至顶部"
        case .staircase: return "竖排歌词列与阶梯引导线，底部独立播放胶囊"
        case .floating: return "满幅大字排版、层叠上下文和专辑色纹理背景"
        case .chorus: return "全宽对话气泡、头像与深色聊天背景"
        case .tilt: return "大字居中、倾斜上下文与流动主题色背景"
        case .orbit: return "整幅椭圆歌词轨道，底部居中播放控制"
        case .diorama: return "透视歌词走廊、几何粒子与明亮专辑色背景"
        case .clockwork: return "左侧转动齿轮与时钟、右侧歌词、底部控制胶囊"
        case .sonnet: return "整窗海报边框、编号和大字歌词构图"
        case .tempera: return "整窗上下色块、巨型编号和分割线歌词构图"
        case .lumiere: return "深色舞台、贯穿窗口的光束与居中大字"
        case .monet: return "左侧歌手、歌名与专辑海报，右侧倾斜封面"
        case .still: return "原版专辑渐变背景、居中三行歌词和静态播放布局"
        }
    }

    static func resolve(_ rawValue: String) -> NativeLyricStyle {
        NativeLyricStyle(rawValue: rawValue) ?? .luminous
    }
}
