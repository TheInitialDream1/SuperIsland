import SwiftUI
import ImageIO

struct ClipboardHistoryView: View {
    @EnvironmentObject private var appState: AppState
    @ObservedObject var history: ClipboardHistoryStore = .shared
    @State private var query = ""
    @State private var filter: ClipboardRecord.Kind?
    @State private var pinnedOnly = false
    @State private var selection: UUID?
    @State private var copyResult: CopyResult?
    @State private var confirmClear = false
    @FocusState private var searchFocused: Bool
    @State private var holdID = UUID()

    private struct CopyResult: Equatable {
        let recordID: UUID
        let succeeded: Bool
    }

    var body: some View {
        let records = matchingRecords
        let selected = records.first { $0.id == selection } ?? records.first

        VStack(alignment: .leading, spacing: 9) {
            header
            searchBar
            if confirmClear { clearControls }
            if history.storageError {
                Text("Clipboard history could not be saved.")
                    .font(.caption)
                    .foregroundStyle(.orange)
            }
            if let selected {
                HStack(spacing: 10) {
                    list(records, selectedID: selected.id)
                        .frame(maxWidth: .infinity)
                    preview(selected)
                        .frame(maxWidth: .infinity)
                }
            } else {
                emptyState
            }
        }
        .onChange(of: searchFocused) { _, _ in syncPresentationHold() }
        .onChange(of: confirmClear) { _, _ in syncPresentationHold() }
        .onDisappear { appState.endPopoverInteraction(id: holdID) }
        .task(id: copyResult) {
            guard copyResult != nil else { return }
            do { try await Task.sleep(for: .seconds(1.7)) } catch { return }
            copyResult = nil
        }
    }

    private var matchingRecords: [ClipboardRecord] {
        let needle = query.trimmingCharacters(in: .whitespacesAndNewlines)
        return history.records.filter {
            (filter == nil || $0.kind == filter)
                && (!pinnedOnly || $0.pinned)
                && (needle.isEmpty || ($0.text ?? $0.summary).localizedStandardContains(needle)
                    || $0.kind.title.localizedStandardContains(needle))
        }
    }

    private var header: some View {
        HStack(spacing: 9) {
            Text("Clipboard History")
                .font(.system(size: 17, weight: .semibold))
                .accessibilityAddTraits(.isHeader)
            Spacer(minLength: 4)
            Toggle(isOn: $appState.clipboardRecordingEnabled) {
                Text(appState.clipboardRecordingEnabled ? "Recording" : "Recording paused")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(.white.opacity(0.7))
            }
            .toggleStyle(.switch)
            .controlSize(.small)
            .tint(.mint)
            .accessibilityLabel("Record Clipboard History")

            iconButton("Clear Clipboard History", symbol: "trash") { confirmClear.toggle() }
                .disabled(history.records.isEmpty)
        }
    }

    private var searchBar: some View {
        HStack(spacing: 8) {
            HStack(spacing: 7) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(.white.opacity(0.55))
                    .accessibilityHidden(true)
                TextField("Search clipboard", text: $query)
                    .textFieldStyle(.plain)
                    .focused($searchFocused)
                    .font(.system(size: 12))
                if !query.isEmpty {
                    iconButton("Clear Search", symbol: "xmark.circle.fill") { query = "" }
                }
            }
            .padding(.horizontal, 9)
            .frame(minWidth: 120, maxWidth: .infinity, minHeight: 31)
            .background(.white.opacity(0.08), in: RoundedRectangle(cornerRadius: 8))
            .overlay {
                RoundedRectangle(cornerRadius: 8)
                    .strokeBorder(searchFocused ? .mint.opacity(0.7) : .white.opacity(0.09), lineWidth: 1)
                    .allowsHitTesting(false)
            }

            Picker("Clipboard Type", selection: $filter) {
                Text("All Types").tag(nil as ClipboardRecord.Kind?)
                ForEach(ClipboardRecord.Kind.allCases) { kind in
                    Text(kind.title).tag(Optional(kind))
                }
            }
            .labelsHidden()
            .pickerStyle(.segmented)
            .accessibilityLabel("Clipboard Type")
            .fixedSize(horizontal: true, vertical: false)

            Button { pinnedOnly.toggle() } label: {
                Image(systemName: pinnedOnly ? "pin.fill" : "pin")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(pinnedOnly ? .mint : .white.opacity(0.72))
                    .frame(width: 32, height: 31)
                    .background(pinnedOnly ? .mint.opacity(0.16) : .white.opacity(0.07),
                                in: RoundedRectangle(cornerRadius: 8))
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .hoverPointer()
            .help("Pinned Only")
            .accessibilityLabel("Pinned Only")
            .accessibilityAddTraits(pinnedOnly ? .isSelected : [])
        }
    }

    private var clearControls: some View {
        HStack(spacing: 8) {
            Text("Clear Clipboard History")
                .font(.caption.weight(.medium))
            Spacer(minLength: 0)
            Button("Clear Unpinned Items") { clearHistory(keepingPinned: true) }
            Button("Clear All Items", role: .destructive) { clearHistory(keepingPinned: false) }
            Button("Cancel") { confirmClear = false }
        }
        .controlSize(.small)
        .padding(7)
        .background(.white.opacity(0.07), in: RoundedRectangle(cornerRadius: 8))
    }

    private func list(_ records: [ClipboardRecord], selectedID: UUID) -> some View {
        ScrollView {
            LazyVStack(spacing: 2) {
                ForEach(records) { record in
                    listRow(record, selected: record.id == selectedID)
                }
            }
            .padding(4)
        }
        .accessibilityLabel("Clipboard History")
        .background(.black.opacity(0.24), in: RoundedRectangle(cornerRadius: 11))
        .overlay {
            RoundedRectangle(cornerRadius: 11)
                .strokeBorder(.white.opacity(0.08), lineWidth: 1)
                .allowsHitTesting(false)
        }
    }

    private func listRow(_ record: ClipboardRecord, selected: Bool) -> some View {
        Button { selection = record.id } label: {
            HStack(spacing: 8) {
                recordIcon(record, size: 28)
                VStack(alignment: .leading, spacing: 3) {
                    Text(record.summary.isEmpty ? record.kind.title : record.summary)
                        .font(.system(size: 12, weight: selected ? .semibold : .medium))
                        .lineLimit(1)
                    Text(record.date, format: .dateTime.month().day().hour().minute())
                        .font(.system(size: 10))
                        .foregroundStyle(.white.opacity(0.57))
                        .lineLimit(1)
                }
                Spacer(minLength: 3)
                if record.pinned {
                    Image(systemName: "pin.fill")
                        .font(.system(size: 9))
                        .foregroundStyle(.mint)
                        .accessibilityHidden(true)
                }
            }
            .padding(.horizontal, 7)
            .frame(height: 43)
            .background(selected ? .mint.opacity(0.13) : .clear, in: RoundedRectangle(cornerRadius: 7))
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .hoverPointer()
        .accessibilityAddTraits(selected ? .isSelected : [])
        .accessibilityValue(record.pinned ? L10n.string("Pinned") : "")
    }

    private func preview(_ record: ClipboardRecord) -> some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack(spacing: 6) {
                Label(record.kind.title, systemImage: record.kind.icon)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.white.opacity(0.66))
                Spacer(minLength: 4)
                iconButton(record.pinned ? "Unpin" : "Pin", symbol: record.pinned ? "pin.fill" : "pin",
                           tint: record.pinned ? .mint : .white.opacity(0.72)) { history.setPinned(record) }
                iconButton("Remove", symbol: "xmark") { history.remove(record) }
            }
            previewContent(record)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            let result = copyResult?.recordID == record.id ? copyResult : nil
            Button {
                copyResult = CopyResult(recordID: record.id, succeeded: history.copy(record))
            } label: {
                Label(result?.succeeded == true ? "Copied" : result == nil ? "Copy again" : "Could not copy",
                      systemImage: result?.succeeded == true ? "checkmark" : "doc.on.doc")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(.mint)
                    .frame(maxWidth: .infinity, minHeight: 30)
                    .background(.mint.opacity(0.15), in: RoundedRectangle(cornerRadius: 7))
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .hoverPointer()
        }
        .padding(9)
        .background(.white.opacity(0.055), in: RoundedRectangle(cornerRadius: 11))
        .overlay {
            RoundedRectangle(cornerRadius: 11)
                .strokeBorder(.white.opacity(0.08), lineWidth: 1)
                .allowsHitTesting(false)
        }
    }

    @ViewBuilder private func previewContent(_ record: ClipboardRecord) -> some View {
        if record.kind == .image {
            ClipboardImagePreview(data: record.imageData, maxPixels: 460)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .accessibilityLabel("Image Preview")
        } else {
            ScrollView {
                Text(record.text ?? record.files?.map(\.path).joined(separator: "\n") ?? record.summary)
                    .font(.system(size: 12))
                    .textSelection(.enabled)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 8) {
            Image(systemName: history.records.isEmpty ? "clipboard" : "magnifyingglass")
                .font(.system(size: 21, weight: .medium))
                .foregroundStyle(.mint.opacity(0.8))
                .accessibilityHidden(true)
            Text(history.records.isEmpty ? "No clipboard history" : "No matching clipboard items.")
                .font(.system(size: 13, weight: .semibold))
            if history.records.isEmpty {
                Text(appState.clipboardRecordingEnabled ? "Copy something to start your history." : "Turn on recording to save future copies on this Mac.")
                    .font(.system(size: 11))
                    .foregroundStyle(.white.opacity(0.61))
            }
        }
        .multilineTextAlignment(.center)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(.white.opacity(0.045), in: RoundedRectangle(cornerRadius: 11))
    }

    private func recordIcon(_ record: ClipboardRecord, size: CGFloat) -> some View {
        let color: Color
        switch record.kind {
        case .text: color = .cyan
        case .link: color = .mint
        case .image: color = .purple
        case .files: color = .orange
        }

        return Group {
            if record.kind == .image {
                ClipboardImagePreview(data: record.imageData, maxPixels: 64)
            } else {
                Image(systemName: record.kind.icon)
                    .font(.system(size: 12, weight: .medium))
            }
        }
        .foregroundStyle(color)
        .frame(width: size, height: size)
        .background(color.opacity(0.13), in: RoundedRectangle(cornerRadius: 7))
        .clipShape(RoundedRectangle(cornerRadius: 7))
        .accessibilityHidden(true)
    }

    private func iconButton(_ title: LocalizedStringKey, symbol: String,
                            tint: Color = .white.opacity(0.72), action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(tint)
                .frame(width: 27, height: 27)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .hoverPointer()
        .help(title)
        .accessibilityLabel(title)
    }

    private func clearHistory(keepingPinned: Bool) {
        history.clear(keepingPinned: keepingPinned)
        confirmClear = false
    }

    private func syncPresentationHold() {
        if searchFocused || confirmClear {
            appState.beginPopoverInteraction(id: holdID, for: NativeUtilityExtension.clipboard.module)
        } else {
            appState.endPopoverInteraction(id: holdID)
        }
    }
}

private struct ClipboardImagePreview: View {
    let data: Data?
    let maxPixels: Int
    @State private var image: CGImage?

    var body: some View {
        Group {
            if let image {
                Image(decorative: image, scale: 1).resizable().scaledToFit()
            } else {
                Image(systemName: "photo")
            }
        }
        .task(id: data) {
            image = nil
            guard let data else { return }
            let thumbnail = await Task.detached(priority: .utility) {
                guard let source = CGImageSourceCreateWithData(data as CFData, nil) else { return nil as CGImage? }
                let options = [
                    kCGImageSourceCreateThumbnailFromImageAlways: true,
                    kCGImageSourceCreateThumbnailWithTransform: true,
                    kCGImageSourceThumbnailMaxPixelSize: maxPixels
                ] as CFDictionary
                return CGImageSourceCreateThumbnailAtIndex(source, 0, options)
            }.value
            if !Task.isCancelled { image = thumbnail }
        }
    }
}
