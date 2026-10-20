import SwiftUI
import AppKit

struct ExtensionRendererView: View {
    let extensionID: String
    let displayMode: DisplayMode

    @ObservedObject private var manager = ExtensionManager.shared

    var body: some View {
        Group {
            if let state = manager.extensionStates[extensionID] {
                ViewNodeRenderer(
                    node: node(from: state),
                    extensionID: extensionID
                )
                .frame(
                    maxWidth: .infinity,
                    maxHeight: displayMode == .fullExpanded ? .infinity : nil,
                    alignment: containerAlignment
                )
            } else {
                ProgressView()
                    .controlSize(.small)
                    .tint(.white)
            }
        }
        .onReceive(NowPlayingManager.shared.$title.combineLatest(NowPlayingManager.shared.$artist)) { _ in
            if extensionID == "com.wangxulong.superisland.synced-lyrics" {
                manager.scheduleImmediateRefresh(extensionID: extensionID)
            }
        }
    }

    private var containerAlignment: Alignment {
        switch displayMode {
        case .minimalLeading:
            return .leading
        case .minimalTrailing:
            return .trailing
        case .fullExpanded:
            return .topLeading
        default:
            return .leading
        }
    }

    private func node(from state: ExtensionViewState) -> ViewNode {
        switch displayMode {
        case .compact:
            return state.compact
        case .expanded:
            return state.expanded
        case .fullExpanded:
            return state.fullExpanded ?? state.expanded
        case .minimalLeading:
            return state.minimalLeading ?? .empty
        case .minimalTrailing:
            return state.minimalTrailing ?? .empty
        }
    }
}

struct ViewNodeRenderer: View {
    let node: ViewNode
    let extensionID: String

    @ObservedObject private var manager = ExtensionManager.shared

    @ViewBuilder
    var body: some View {
        switch node {
        case .text(let value, let style, let color, let lineLimit):
            Text(L10n.extensionText(value, extensionID: extensionID))
                .font(style.font)
                .foregroundStyle(color.swiftUI)
                .lineLimit(lineLimit)
                .truncationMode(.tail)
                .multilineTextAlignment(.leading)

        case .marqueeText(let value, let style, let color):
            ExtensionMarqueeTextNode(
                value: L10n.extensionText(value, extensionID: extensionID),
                style: style,
                color: color.swiftUI
            )

        case .markdownText(let value, let style, let color, let lineLimit):
            ExtensionMarkdownTextNode(
                markdown: L10n.extensionText(value, extensionID: extensionID),
                style: style,
                color: color.swiftUI,
                lineLimit: lineLimit
            )

        case .icon(let name, let size, let color):
            Image(systemName: name)
                .font(.system(size: size))
                .foregroundStyle(color.swiftUI)

        case .image(let urlString, let width, let height, let cornerRadius):
            if let image = inlineImage(from: urlString) {
                Image(nsImage: image)
                    .resizable()
                    .scaledToFill()
                    .frame(width: width, height: height)
                    .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
            } else if let url = URL(string: urlString) {
                AsyncImage(url: url) { image in
                    image
                        .resizable()
                        .scaledToFill()
                } placeholder: {
                    Color.white.opacity(0.1)
                }
                .frame(width: width, height: height)
                .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
            } else {
                Color.clear
                    .frame(width: width, height: height)
            }

        case .hstack(let spacing, let align, let distribution, let children):
            HStack(alignment: verticalAlignment(from: align), spacing: spacing) {
                ForEach(Array(children.enumerated()), id: \.offset) { _, child in
                    if distribution == "fillEqually" {
                        ViewNodeRenderer(node: child, extensionID: extensionID)
                            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
                    } else {
                        ViewNodeRenderer(node: child, extensionID: extensionID)
                    }
                }
            }

        case .vstack(let spacing, let align, let distribution, let children):
            VStack(alignment: horizontalAlignment(from: align), spacing: spacing) {
                ForEach(Array(children.enumerated()), id: \.offset) { _, child in
                    if distribution == "fillEqually" {
                        ViewNodeRenderer(node: child, extensionID: extensionID)
                            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
                    } else {
                        ViewNodeRenderer(node: child, extensionID: extensionID)
                    }
                }
            }

        case .zstack(let children):
            ZStack {
                ForEach(Array(children.enumerated()), id: \.offset) { _, child in
                    ViewNodeRenderer(node: child, extensionID: extensionID)
                }
            }

        case .spacer(let minLength):
            Spacer(minLength: minLength.map { CGFloat($0) })

        case .scroll(let child, let axes, let showsIndicators):
            ScrollView(axisSet(from: axes), showsIndicators: showsIndicators) {
                ViewNodeRenderer(node: child, extensionID: extensionID)
                    .frame(maxWidth: .infinity, alignment: .topLeading)
            }

        case .progress(let value, let total, let color):
            ZStack {
                Capsule()
                    .fill(Color.white.opacity(0.14))
                    .frame(maxWidth: .infinity)
                    .frame(height: 6)

                ProgressView(value: value, total: total)
                    .progressViewStyle(.linear)
                    .tint(color.swiftUI)
            }
            .frame(maxWidth: .infinity, minHeight: 6)

        case .circularProgress(let value, let total, let lineWidth, let color):
            ExtensionCircularProgressNode(
                value: value,
                total: total,
                lineWidth: lineWidth,
                color: color.swiftUI
            )

        case .gauge(let value, let min, let max, let label):
            Gauge(value: value, in: min...max) {
                Text(L10n.extensionText(label ?? "", extensionID: extensionID))
            }

        case .divider:
            Divider()

        case .button(let label, let actionID):
            Button {
                manager.handleAction(extensionID: extensionID, actionID: actionID)
            } label: {
                ViewNodeRenderer(node: label, extensionID: extensionID)
            }
            .buttonStyle(.plain)
            .hoverPointer()

        case .inputBox(let inputID, let placeholder, let text, let actionID, let autoFocus, let minHeight, let showsEmojiButton):
            ExtensionInputBoxNode(
                extensionID: extensionID,
                inputID: inputID,
                placeholder: L10n.extensionText(placeholder, extensionID: extensionID),
                text: text,
                actionID: actionID,
                autoFocus: autoFocus,
                minHeight: minHeight,
                showsEmojiButton: showsEmojiButton
            )
            .id(inputID.isEmpty ? "\(extensionID)-\(actionID)" : inputID)

        case .toggle(let isOn, let label, let actionID):
            ExtensionToggleNode(
                extensionID: extensionID,
                label: L10n.extensionText(label, extensionID: extensionID),
                isOn: isOn,
                actionID: actionID
            )

        case .slider(let value, let min, let max, let actionID):
            ExtensionSliderNode(
                extensionID: extensionID,
                value: value,
                min: min,
                max: max,
                actionID: actionID
            )

        case .nowPlayingLyrics(let content):
            if hasMediaPermission {
                NowPlayingLyricsView(content: content, onAction: { actionID in
                    manager.handleAction(extensionID: extensionID, actionID: actionID)
                }) {
                    manager.handleAction(extensionID: extensionID, actionID: "retry")
                }
            } else {
                EmptyView()
            }

        case .nowPlayingPlayer(let artworkSize, let showArtwork):
            if hasMediaPermission {
                ExtensionNowPlayingPlayerNode(artworkSize: artworkSize, showArtwork: showArtwork)
            } else {
                EmptyView()
            }

        case .nowPlayingArtwork(let size, let cornerRadius):
            if hasMediaPermission {
                ExtensionNowPlayingArtworkNode(size: size, cornerRadius: cornerRadius)
            } else {
                EmptyView()
            }

        case .nowPlayingTransport(let showProgress):
            if hasMediaPermission {
                ExtensionNowPlayingTransportNode(showProgress: showProgress)
            } else {
                EmptyView()
            }

        case .nowPlayingBackdrop(let child):
            if hasMediaPermission {
                ExtensionNowPlayingBackdropNode {
                    ViewNodeRenderer(node: child, extensionID: extensionID)
                }
            } else {
                EmptyView()
            }

        case .padding(let child, let edges, let amount):
            ViewNodeRenderer(node: child, extensionID: extensionID)
                .padding(edgeSet(from: edges), amount)

        case .frame(let child, let width, let height, let maxWidth, let maxHeight, let alignment):
            ViewNodeRenderer(node: child, extensionID: extensionID)
                .frame(
                    width: width.map { CGFloat($0) },
                    height: height.map { CGFloat($0) },
                    alignment: frameAlignment(from: alignment)
                )
                .frame(
                    maxWidth: maxWidth.map { CGFloat($0) },
                    maxHeight: maxHeight.map { CGFloat($0) },
                    alignment: frameAlignment(from: alignment)
                )

        case .opacity(let child, let value):
            ViewNodeRenderer(node: child, extensionID: extensionID)
                .opacity(value)

        case .background(let child, let color):
            ViewNodeRenderer(node: child, extensionID: extensionID)
                .background(color.swiftUI)

        case .cornerRadius(let child, let radius):
            ViewNodeRenderer(node: child, extensionID: extensionID)
                .clipShape(RoundedRectangle(cornerRadius: radius))

        case .animation(let child, let kind):
            ExtensionAnimatedNode(kind: kind) {
                ViewNodeRenderer(node: child, extensionID: extensionID)
            }

        case .mascot(let size, let expression):
            MascotRendererView(size: size, extensionID: extensionID, expressionOverride: expression)

        case .empty:
            EmptyView()
        }
    }

    private func verticalAlignment(from value: String) -> VerticalAlignment {
        switch value {
        case "top": return .top
        case "bottom": return .bottom
        default: return .center
        }
    }

    private func horizontalAlignment(from value: String) -> HorizontalAlignment {
        switch value {
        case "leading": return .leading
        case "trailing": return .trailing
        default: return .center
        }
    }

    private func edgeSet(from value: String) -> Edge.Set {
        switch value {
        case "horizontal": return .horizontal
        case "vertical": return .vertical
        default: return .all
        }
    }

    private func axisSet(from value: String) -> Axis.Set {
        switch value {
        case "horizontal":
            return .horizontal
        case "both":
            return [.horizontal, .vertical]
        default:
            return .vertical
        }
    }

    private func frameAlignment(from value: String) -> Alignment {
        switch value {
        case "leading": return .leading
        case "trailing": return .trailing
        case "top": return .top
        case "bottom": return .bottom
        case "topLeading": return .topLeading
        case "topTrailing": return .topTrailing
        case "bottomLeading": return .bottomLeading
        case "bottomTrailing": return .bottomTrailing
        default: return .center
        }
    }

    private func inlineImage(from urlString: String) -> NSImage? {
        guard urlString.hasPrefix("data:image/") else { return nil }
        guard let commaIndex = urlString.firstIndex(of: ",") else { return nil }

        let metadata = String(urlString[..<commaIndex])
        let payload = String(urlString[urlString.index(after: commaIndex)...])

        if metadata.contains(";base64"),
           let data = Data(base64Encoded: payload, options: .ignoreUnknownCharacters),
           let image = NSImage(data: data) {
            return image
        }

        guard let decoded = payload.removingPercentEncoding,
              let data = decoded.data(using: .utf8),
              let image = NSImage(data: data) else {
            return nil
        }

        return image
    }

    private var hasMediaPermission: Bool {
        manager.installed
            .first(where: { $0.id == extensionID })?
            .permissions
            .contains("media") == true
    }
}

private struct ExtensionMarkdownTextNode: View {
    let markdown: String
    let style: TextStyle
    let color: Color
    let lineLimit: Int?

    var body: some View {
        Text(attributedText)
            .lineLimit(lineLimit)
            .truncationMode(.tail)
            .multilineTextAlignment(.leading)
            .tint(.blue)
            .hoverPointer()
    }

    private var attributedText: AttributedString {
        let options = AttributedString.MarkdownParsingOptions(
            interpretedSyntax: .inlineOnlyPreservingWhitespace
        )
        var attributed = (try? AttributedString(markdown: markdown, options: options)) ?? AttributedString(markdown)

        for run in attributed.runs {
            attributed[run.range].font = style.font
            if run.link == nil {
                attributed[run.range].foregroundColor = color
            }
        }

        return attributed
    }
}

private struct ExtensionMarqueeTextNode: View {
    let value: String
    let style: TextStyle
    let color: Color

    @State private var containerWidth: CGFloat = 0
    @State private var textWidth: CGFloat = 0
    @State private var isHovered: Bool = false
    @State private var animate: Bool = false

    private let gap: CGFloat = 32
    private let fadeWidth: CGFloat = 14
    private let pointsPerSecond: CGFloat = 34

    private var shouldScroll: Bool {
        textWidth > containerWidth + 4 && containerWidth > 0
    }

    private var travelDistance: CGFloat {
        textWidth + gap
    }

    private var scrollDuration: Double {
        Double(max(2.8, travelDistance / pointsPerSecond))
    }

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                if shouldScroll && isHovered {
                    marqueeContent
                        .offset(x: animate ? -travelDistance : 0)
                        .animation(.linear(duration: scrollDuration).repeatForever(autoreverses: false), value: animate)
                        .mask(fadeMask(width: geometry.size.width))
                        .clipped()
                        .onAppear {
                            startScrollingIfNeeded()
                        }
                        .onChange(of: isHovered) { _, _ in
                            startScrollingIfNeeded()
                        }
                } else {
                    measuredText(lineLimit: 1)
                        .truncationMode(.tail)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .contentShape(Rectangle())
            .onAppear {
                containerWidth = geometry.size.width
            }
            .onChange(of: value) { _, _ in
                animate = false
            }
            .onChange(of: geometry.size.width) { _, newValue in
                containerWidth = newValue
                if !shouldScroll {
                    animate = false
                }
            }
            .onHover { hovering in
                isHovered = hovering
                if hovering {
                    startScrollingIfNeeded()
                } else {
                    animate = false
                }
            }
        }
        .frame(height: textHeight)
        .hoverPointer()
    }

    private var marqueeContent: some View {
        HStack(spacing: gap) {
            measuredText(lineLimit: 1)
                .fixedSize(horizontal: true, vertical: false)
            measuredText(lineLimit: 1)
                .fixedSize(horizontal: true, vertical: false)
        }
    }

    private func measuredText(lineLimit: Int?) -> some View {
        Text(value)
            .font(style.font)
            .foregroundStyle(color)
            .lineLimit(lineLimit)
            .background(
                GeometryReader { proxy in
                    Color.clear
                        .onAppear {
                            textWidth = proxy.size.width
                        }
                        .onChange(of: proxy.size.width) { _, newValue in
                            textWidth = newValue
                        }
                }
            )
    }

    private func fadeMask(width: CGFloat) -> some View {
        let resolvedFade = min(fadeWidth, max(0, width * 0.15))
        return LinearGradient(
            stops: [
                .init(color: .clear, location: 0),
                .init(color: .black, location: min(0.08, resolvedFade / max(width, 1))),
                .init(color: .black, location: max(0.92, 1 - (resolvedFade / max(width, 1)))),
                .init(color: .clear, location: 1)
            ],
            startPoint: .leading,
            endPoint: .trailing
        )
    }

    private var textHeight: CGFloat {
        switch style {
        case .largeTitle:
            return 32
        case .title:
            return 22
        case .subtitle:
            return 18
        case .lyricActive:
            return 28
        case .lyric:
            return 16
        case .headline, .monospaced:
            return 18
        case .body:
            return 17
        case .caption, .footnote, .monospacedSmall:
            return 15
        }
    }

    private func startScrollingIfNeeded() {
        guard shouldScroll && isHovered else {
            animate = false
            return
        }
        animate = false
        DispatchQueue.main.async {
            animate = true
        }
    }
}

private struct ExtensionCircularProgressNode: View {
    let value: Double
    let total: Double
    let lineWidth: Double
    let color: Color

    private var normalizedProgress: Double {
        guard total > 0 else { return 0 }
        let raw = value / total
        return min(1, max(0, raw))
    }

    private var strokeWidth: CGFloat {
        max(1, CGFloat(lineWidth))
    }

    private var diameter: CGFloat {
        max(10, strokeWidth * 4)
    }

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.white.opacity(0.18), lineWidth: strokeWidth)

            Circle()
                .trim(from: 0, to: normalizedProgress)
                .stroke(
                    color,
                    style: StrokeStyle(lineWidth: strokeWidth, lineCap: .round, lineJoin: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 0.2), value: normalizedProgress)
        }
        .frame(width: diameter, height: diameter)
    }
}

private struct ExtensionToggleNode: View {
    let extensionID: String
    let label: String
    let isOn: Bool
    let actionID: String

    @ObservedObject private var manager = ExtensionManager.shared
    @State private var localValue: Bool

    init(extensionID: String, label: String, isOn: Bool, actionID: String) {
        self.extensionID = extensionID
        self.label = label
        self.isOn = isOn
        self.actionID = actionID
        _localValue = State(initialValue: isOn)
    }

    var body: some View {
        HStack(spacing: 12) {
            Text(label)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(.white.opacity(0.92))
                .lineLimit(1)

            Spacer(minLength: 12)

            Toggle("", isOn: Binding(
                get: { localValue },
                set: { newValue in
                    localValue = newValue
                    manager.handleAction(extensionID: extensionID, actionID: actionID, value: newValue)
                }
            ))
            .labelsHidden()
            .toggleStyle(.switch)
            .tint(.white.opacity(0.9))
        }
    }
}

private struct ExtensionInputBoxNode: View {
    private static let inputFont = NSFont.systemFont(ofSize: 12, weight: .medium)
    private static let inputLineHeight = ceil(inputFont.ascender - inputFont.descender + inputFont.leading)

    let extensionID: String
    let inputID: String
    let placeholder: String
    let text: String
    let actionID: String
    let autoFocus: Bool
    let minHeight: Double
    let showsEmojiButton: Bool

    private var boxHeight: CGFloat {
        CGFloat(max(46, minHeight))
    }

    private var boxCornerRadius: CGFloat {
        appState.currentCornerRadius
    }

    private var textHorizontalInset: CGFloat {
        12
    }

    private var textVerticalInset: CGFloat {
        max(8, floor((boxHeight - Self.inputLineHeight) / 2))
    }

    @ObservedObject private var manager = ExtensionManager.shared
    @ObservedObject private var appState = AppState.shared
    @State private var localText: String
    @State private var shouldFocus: Bool = false
    @State private var shouldOpenEmojiPicker: Bool = false

    init(
        extensionID: String,
        inputID: String,
        placeholder: String,
        text: String,
        actionID: String,
        autoFocus: Bool,
        minHeight: Double,
        showsEmojiButton: Bool
    ) {
        self.extensionID = extensionID
        self.inputID = inputID
        self.placeholder = placeholder
        self.text = text
        self.actionID = actionID
        self.autoFocus = autoFocus
        self.minHeight = minHeight
        self.showsEmojiButton = showsEmojiButton
        _localText = State(initialValue: text)
    }

    var body: some View {
        ZStack(alignment: .topLeading) {
            ExtensionInputTextView(
                text: $localText,
                shouldFocus: $shouldFocus,
                shouldOpenEmojiPicker: $shouldOpenEmojiPicker,
                fixedHeight: boxHeight,
                horizontalInset: textHorizontalInset,
                minimumVerticalInset: 8
            ) {
                submit()
            }
            .padding(.trailing, showsEmojiButton ? 30 : 0)
            if localText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                Text(placeholder)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(.white.opacity(0.34))
                    .padding(.leading, textHorizontalInset)
                    .padding(.top, textVerticalInset)
                    .padding(.trailing, showsEmojiButton ? 36 : textHorizontalInset)
                    .allowsHitTesting(false)
            }
        }
            .frame(maxWidth: .infinity, alignment: .topLeading)
            .frame(height: boxHeight, alignment: .topLeading)
            .background(
                RoundedRectangle(cornerRadius: boxCornerRadius, style: .continuous)
                    .fill(.white.opacity(0.08))
            )
            .overlay(
                RoundedRectangle(cornerRadius: boxCornerRadius, style: .continuous)
                    .stroke(.white.opacity(0.08), lineWidth: 1)
            )
            .overlay(alignment: .bottomTrailing) {
                if showsEmojiButton {
                    Button {
                        shouldFocus = true
                        shouldOpenEmojiPicker = true
                    } label: {
                        Image(systemName: "face.smiling")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(.white.opacity(0.72))
                            .frame(width: 24, height: 24)
                    }
                    .buttonStyle(.plain)
                    .hoverPointer()
                    .padding(.trailing, 10)
                    .padding(.bottom, 8)
                }
            }
            .onChange(of: text) { _, newValue in
                if newValue != localText {
                    localText = newValue
                }
            }
            .onAppear {
                guard autoFocus else { return }
                DispatchQueue.main.async {
                    shouldFocus = true
                }
            }
    }

    private func submit() {
        let trimmed = localText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        manager.handleAction(extensionID: extensionID, actionID: actionID, value: trimmed)
        localText = ""
        shouldFocus = true
    }
}

private struct ExtensionInputTextView: NSViewRepresentable {
    private static let inputFont = NSFont.systemFont(ofSize: 12, weight: .medium)

    @Binding var text: String
    @Binding var shouldFocus: Bool
    @Binding var shouldOpenEmojiPicker: Bool

    let fixedHeight: CGFloat
    let horizontalInset: CGFloat
    let minimumVerticalInset: CGFloat
    let onSubmit: () -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(
            text: $text,
            shouldFocus: $shouldFocus,
            shouldOpenEmojiPicker: $shouldOpenEmojiPicker,
            onSubmit: onSubmit
        )
    }

    func makeNSView(context: Context) -> NSScrollView {
        let scrollView = NSScrollView()
        scrollView.drawsBackground = false
        scrollView.borderType = .noBorder
        scrollView.hasVerticalScroller = true
        scrollView.hasHorizontalScroller = false
        scrollView.autohidesScrollers = true
        scrollView.scrollerStyle = .overlay
        scrollView.verticalScrollElasticity = .none

        let textView = SubmitAwareTextView()
        textView.delegate = context.coordinator
        textView.string = text
        textView.drawsBackground = false
        textView.isRichText = false
        textView.importsGraphics = false
        textView.isEditable = true
        textView.isSelectable = true
        textView.usesFindBar = false
        textView.usesFontPanel = false
        textView.isAutomaticQuoteSubstitutionEnabled = false
        textView.isAutomaticDashSubstitutionEnabled = false
        textView.isAutomaticDataDetectionEnabled = false
        textView.isAutomaticTextReplacementEnabled = false
        textView.isContinuousSpellCheckingEnabled = false
        textView.font = Self.inputFont
        textView.textColor = .white
        textView.insertionPointColor = .white
        textView.caretWidth = 1
        textView.fixedHeight = fixedHeight
        textView.horizontalInset = horizontalInset
        textView.minimumVerticalInset = minimumVerticalInset
        textView.onSubmit = {
            context.coordinator.handleSubmit()
        }

        if let textContainer = textView.textContainer {
            textContainer.widthTracksTextView = true
            textContainer.containerSize = NSSize(width: 0, height: CGFloat.greatestFiniteMagnitude)
            textContainer.lineFragmentPadding = 0
        }

        textView.isVerticallyResizable = true
        textView.isHorizontallyResizable = false
        textView.maxSize = NSSize(width: CGFloat.greatestFiniteMagnitude, height: CGFloat.greatestFiniteMagnitude)
        textView.minSize = NSSize(width: 0, height: fixedHeight)
        textView.translatesAutoresizingMaskIntoConstraints = true
        textView.autoresizingMask = [.width]
        textView.recenterTextIfNeeded()
        scrollView.documentView = textView
        scrollView.contentView.postsBoundsChangedNotifications = true
        scrollView.contentView.automaticallyAdjustsContentInsets = false

        context.coordinator.textView = textView
        return scrollView
    }

    func updateNSView(_ scrollView: NSScrollView, context: Context) {
        guard let textView = context.coordinator.textView else { return }

        if textView.string != text {
            textView.string = text
        }

        if let textContainer = textView.textContainer {
            textContainer.containerSize = NSSize(width: scrollView.contentSize.width, height: .greatestFiniteMagnitude)
        }

        textView.minSize = NSSize(width: 0, height: fixedHeight)
        textView.fixedHeight = fixedHeight
        textView.horizontalInset = horizontalInset
        textView.minimumVerticalInset = minimumVerticalInset
        textView.recenterTextIfNeeded()

        if shouldFocus, textView.window?.firstResponder !== textView {
            textView.window?.makeKeyAndOrderFront(nil)
            textView.window?.makeFirstResponder(textView)
            DispatchQueue.main.async {
                shouldFocus = false
            }
        }

        if shouldOpenEmojiPicker {
            textView.window?.makeKeyAndOrderFront(nil)
            textView.window?.makeFirstResponder(textView)
            DispatchQueue.main.async {
                AppState.shared.beginSystemEmojiInteraction()
                NSApp.orderFrontCharacterPalette(nil)
                shouldOpenEmojiPicker = false
            }
        }
    }

    final class Coordinator: NSObject, NSTextViewDelegate {
        @Binding private var text: String
        @Binding private var shouldFocus: Bool
        @Binding private var shouldOpenEmojiPicker: Bool
        let onSubmit: () -> Void

        weak var textView: SubmitAwareTextView?

        init(
            text: Binding<String>,
            shouldFocus: Binding<Bool>,
            shouldOpenEmojiPicker: Binding<Bool>,
            onSubmit: @escaping () -> Void
        ) {
            _text = text
            _shouldFocus = shouldFocus
            _shouldOpenEmojiPicker = shouldOpenEmojiPicker
            self.onSubmit = onSubmit
        }

        func textDidChange(_ notification: Notification) {
            guard let textView else { return }
            text = textView.string
            Task { @MainActor in
                AppState.shared.endSystemEmojiInteraction()
            }
        }

        func handleSubmit() {
            onSubmit()
            shouldFocus = true
            shouldOpenEmojiPicker = false
            Task { @MainActor in
                AppState.shared.endSystemEmojiInteraction()
            }
        }
    }
}

private final class SubmitAwareTextView: NSTextView {
    var onSubmit: (() -> Void)?
    var caretWidth: CGFloat = 1
    var fixedHeight: CGFloat = 46
    var horizontalInset: CGFloat = 12
    var minimumVerticalInset: CGFloat = 8

    override func layout() {
        super.layout()
        recenterTextIfNeeded()
    }

    func recenterTextIfNeeded() {
        let lineHeight = ceil((font?.ascender ?? 11) - (font?.descender ?? -3) + (font?.leading ?? 0))
        let usedHeight: CGFloat
        if string.trimmingCharacters(in: .newlines).isEmpty {
            usedHeight = lineHeight
        } else if let textContainer, let layoutManager {
            layoutManager.ensureLayout(for: textContainer)
            usedHeight = max(lineHeight, ceil(layoutManager.usedRect(for: textContainer).height))
        } else {
            usedHeight = lineHeight
        }

        let insetY = max(minimumVerticalInset, floor((fixedHeight - usedHeight) / 2))
        let targetInset = NSSize(width: horizontalInset, height: insetY)
        if textContainerInset != targetInset {
            textContainerInset = targetInset
        }
    }

    override func keyDown(with event: NSEvent) {
        let modifiers = event.modifierFlags.intersection(.deviceIndependentFlagsMask)
        let isReturn = event.keyCode == 36 || event.keyCode == 76
        if isReturn && !modifiers.contains(.shift) {
            onSubmit?()
            return
        }
        super.keyDown(with: event)
    }

    override func drawInsertionPoint(in rect: NSRect, color: NSColor, turnedOn flag: Bool) {
        let width = max(1, min(caretWidth, rect.width))
        let adjustedRect = NSRect(
            x: rect.midX - (width / 2),
            y: rect.minY,
            width: width,
            height: rect.height
        )
        super.drawInsertionPoint(in: adjustedRect, color: color, turnedOn: flag)
    }
}

private struct ExtensionSliderNode: View {
    let extensionID: String
    let value: Double
    let min: Double
    let max: Double
    let actionID: String

    @ObservedObject private var manager = ExtensionManager.shared
    @State private var localValue: Double

    init(extensionID: String, value: Double, min: Double, max: Double, actionID: String) {
        self.extensionID = extensionID
        self.value = value
        self.min = min
        self.max = max
        self.actionID = actionID
        _localValue = State(initialValue: value)
    }

    var body: some View {
        Slider(
            value: Binding(
                get: { localValue },
                set: { newValue in
                    localValue = newValue
                }
            ),
            in: min...max,
            onEditingChanged: { editing in
                if !editing {
                    manager.handleAction(extensionID: extensionID, actionID: actionID, value: localValue)
                }
            }
        )
    }
}

private struct ExtensionNowPlayingPlayerNode: View {
    let artworkSize: Double
    let showArtwork: Bool

    @ObservedObject private var player = NowPlayingManager.shared
    @State private var progressPresentationID = UUID()

    var body: some View {
        Group {
            if player.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                HStack(spacing: 8) {
                    Image(systemName: "music.note")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundStyle(.white.opacity(0.5))

                    VStack(alignment: .leading, spacing: 2) {
                        Text(player.emptyTitle)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(.white.opacity(0.85))
                            .lineLimit(1)
                        Text(player.emptySubtitle)
                            .font(.system(size: 10))
                            .foregroundStyle(.white.opacity(0.42))
                            .lineLimit(2)
                    }
                }
            } else {
                VStack(alignment: .leading, spacing: 2) {
                    Text(player.title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(.white)
                        .lineLimit(1)

                    Text(secondaryLine)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(.white.opacity(0.48))
                        .lineLimit(1)

                    HStack(alignment: .center, spacing: 10) {
                        if showArtwork {
                            AlbumArtView(image: player.albumArt, size: CGFloat(artworkSize))
                        }

                        VStack(spacing: 2) {
                            controls

                            ProgressBar(
                                progress: player.progress,
                                trackHeight: 3,
                                knobSize: 7,
                                duration: player.duration, context: player.seekContextIdentifier,
                                onPreview: player.previewSeek
                            ) { newProgress in
                                player.seek(to: player.duration * newProgress)
                            }
                            .frame(height: 28)

                            HStack {
                                Text(player.formattedElapsedTime)
                                Spacer(minLength: 8)
                                Text(player.duration > 0 ? player.formattedDuration : "--:--")
                            }
                            .font(.system(size: 9, weight: .medium, design: .rounded))
                            .foregroundStyle(.white.opacity(0.38))
                            .lineLimit(1)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .onAppear {
            player.beginProgressPresentation(id: progressPresentationID)
        }
        .onDisappear {
            player.endProgressPresentation(id: progressPresentationID)
        }
    }

    private var controls: some View {
        HStack(spacing: 10) {
            transportButton(systemName: "backward.fill", action: player.previousTrack)
            transportButton(
                systemName: player.isPlaying ? "pause.fill" : "play.fill",
                action: player.togglePlayPause,
                isPrimary: true
            )
            transportButton(systemName: "forward.fill", action: player.nextTrack)
        }
        .frame(maxWidth: .infinity)
    }

    private func transportButton(
        systemName: String,
        action: @escaping () -> Void,
        isPrimary: Bool = false
    ) -> some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.system(size: isPrimary ? 13 : 11, weight: .semibold))
                .foregroundStyle(.white.opacity(0.94))
                .frame(width: isPrimary ? 28 : 23, height: isPrimary ? 28 : 23)
                .background(
                    Circle().fill(.white.opacity(isPrimary ? 0.14 : 0.07))
                )
                .overlay(
                    Circle().stroke(.white.opacity(isPrimary ? 0.12 : 0.06), lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
        .hoverPointer()
    }

    private var secondaryLine: String {
        let artist = player.artist.trimmingCharacters(in: .whitespacesAndNewlines)
        let album = player.album.trimmingCharacters(in: .whitespacesAndNewlines)
        return [artist, album].filter { !$0.isEmpty }.joined(separator: " · ")
    }
}

private struct ExtensionNowPlayingArtworkNode: View {
    let size: Double
    let cornerRadius: Double

    @ObservedObject private var player = NowPlayingManager.shared

    var body: some View {
        Group {
            if let artwork = player.albumArt {
                Image(nsImage: artwork)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else {
                ZStack {
                    LinearGradient(
                        colors: [
                            Color.white.opacity(0.16),
                            Color.white.opacity(0.05)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )

                    Image(systemName: "music.note")
                        .font(.system(size: max(8, size * 0.3), weight: .medium))
                        .foregroundStyle(.white.opacity(0.58))
                }
            }
        }
        .frame(width: size, height: size)
        .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                .stroke(.white.opacity(0.12), lineWidth: 1)
        }
        .shadow(color: .black.opacity(0.2), radius: size < 32 ? 1 : 8, y: size < 32 ? 0 : 4)
        .accessibilityLabel("专辑封面")
    }
}

private struct ExtensionNowPlayingTransportNode: View {
    let showProgress: Bool

    @ObservedObject private var player = NowPlayingManager.shared
    @State private var progressPresentationID = UUID()

    var body: some View {
        VStack(spacing: 4) {
            if showProgress {
                ProgressBar(
                    progress: player.progress,
                    trackHeight: 3,
                    knobSize: 7,
                    duration: player.duration, context: player.seekContextIdentifier,
                    onPreview: player.previewSeek
                ) { newProgress in
                    player.seek(to: player.duration * newProgress)
                }
                .frame(height: 28)
            }

            HStack(spacing: 8) {
                Text(timeText)
                    .font(.system(size: 10, weight: .medium, design: .rounded))
                    .monospacedDigit()
                    .foregroundStyle(.white.opacity(0.56))
                    .lineLimit(1)

                Spacer(minLength: 10)

                transportButton(systemName: "backward.fill", action: player.previousTrack)
                transportButton(
                    systemName: player.isPlaying ? "pause.fill" : "play.fill",
                    action: player.togglePlayPause,
                    isPrimary: true
                )
                transportButton(systemName: "forward.fill", action: player.nextTrack)
            }
        }
        .frame(maxWidth: .infinity)
        .onAppear {
            player.beginProgressPresentation(id: progressPresentationID)
        }
        .onDisappear {
            player.endProgressPresentation(id: progressPresentationID)
        }
    }

    private var timeText: String {
        let elapsed = player.duration > 0 ? player.formattedElapsedTime : "--:--"
        let duration = player.duration > 0 ? player.formattedDuration : "--:--"
        return "\(elapsed) / \(duration)"
    }

    private func transportButton(
        systemName: String,
        action: @escaping () -> Void,
        isPrimary: Bool = false
    ) -> some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.system(size: isPrimary ? 12 : 10, weight: .bold))
                .foregroundStyle(.white.opacity(isPrimary ? 0.98 : 0.78))
                .frame(width: isPrimary ? 26 : 22, height: isPrimary ? 26 : 22)
                .background(
                    Circle()
                        .fill(.white.opacity(isPrimary ? 0.14 : 0.06))
                )
        }
        .buttonStyle(.plain)
        .hoverPointer()
    }
}

private struct ExtensionNowPlayingBackdropNode<Content: View>: View {
    @ObservedObject private var player = NowPlayingManager.shared
    @ViewBuilder let content: () -> Content

    var body: some View {
        ZStack {
            LinearGradient(
                colors: palette,
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            if let artwork = player.albumArt {
                Image(nsImage: artwork)
                    .resizable()
                    .scaledToFill()
                    .blur(radius: 38)
                    .opacity(0.28)
                    .blendMode(.softLight)
            }

            LinearGradient(
                colors: [
                    .black.opacity(0.18),
                    .black.opacity(0.04),
                    .black.opacity(0.14)
                ],
                startPoint: .top,
                endPoint: .bottom
            )

            content()
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .clipped()
        .animation(
            player.albumArt == nil ? .easeOut(duration: 0.18) : .easeInOut(duration: 0.5),
            value: player.albumArt?.tiffRepresentation
        )
    }

    private var palette: [Color] {
        [
            derivedColor(hueShift: -0.035, saturationScale: 1.08, brightnessScale: 0.82),
            derivedColor(hueShift: 0.025, saturationScale: 1.02, brightnessScale: 0.72),
            derivedColor(hueShift: 0.095, saturationScale: 0.96, brightnessScale: 0.9)
        ]
    }

    private func derivedColor(
        hueShift: CGFloat,
        saturationScale: CGFloat,
        brightnessScale: CGFloat
    ) -> Color {
        let fallback = NSColor(
            hue: 0.38,
            saturation: 0.42,
            brightness: 0.34,
            alpha: 1
        )
        let source = (player.albumArtColor ?? fallback).usingColorSpace(.sRGB) ?? fallback
        var hue: CGFloat = 0
        var saturation: CGFloat = 0
        var brightness: CGFloat = 0
        var alpha: CGFloat = 0
        source.getHue(&hue, saturation: &saturation, brightness: &brightness, alpha: &alpha)

        let shiftedHue = (hue + hueShift + 1).truncatingRemainder(dividingBy: 1)
        return Color(
            hue: Double(shiftedHue),
            saturation: Double(min(max(saturation * saturationScale, 0.38), 0.78)),
            brightness: Double(min(max(brightness * brightnessScale, 0.27), 0.52)),
            opacity: 1
        )
    }
}

private struct ExtensionAnimatedNode<Content: View>: View {
    let kind: String
    @ViewBuilder let content: () -> Content

    @State private var animate = false

    private var bounceAnimation: Animation {
        .easeInOut(duration: 0.5).repeatForever(autoreverses: true)
    }

    private var spinAnimation: Animation {
        .linear(duration: 1.2).repeatForever(autoreverses: false)
    }

    private var blinkAnimation: Animation {
        .easeInOut(duration: 0.45).repeatForever(autoreverses: true)
    }

    private var pulseAnimation: Animation {
        .easeInOut(duration: 0.8).repeatForever(autoreverses: true)
    }

    var body: some View {
        switch kind {
        case "bounce":
            content()
                .scaleEffect(animate ? 1.08 : 0.92)
                .animation(bounceAnimation, value: animate)
                .onAppear { animate = true }
        case "spin":
            content()
                .rotationEffect(.degrees(animate ? 360 : 0))
                .animation(spinAnimation, value: animate)
                .onAppear { animate = true }
        case "blink":
            content()
                .opacity(animate ? 1 : 0.2)
                .animation(blinkAnimation, value: animate)
                .onAppear { animate = true }
        default:
            content()
                .opacity(animate ? 1 : 0.6)
                .animation(pulseAnimation, value: animate)
                .onAppear { animate = true }
        }
    }
}
