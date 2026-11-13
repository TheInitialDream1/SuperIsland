import SwiftUI

/// Keep the island open while a widget's text control has keyboard focus.
private struct IslandWidgetEditingHold: ViewModifier {
    @EnvironmentObject private var appState: AppState
    @State private var holdID = UUID()
    let focused: Bool
    let utility: NativeUtilityExtension

    func body(content: Content) -> some View {
        content
            .onChange(of: focused) { _, focused in
                if focused {
                    appState.beginPopoverInteraction(id: holdID, for: utility.module)
                } else {
                    appState.endPopoverInteraction(id: holdID)
                }
            }
            .onDisappear { appState.endPopoverInteraction(id: holdID) }
    }
}

struct IslandNoteWidget: View {
    // Keep data saved by the earlier standalone widgets.
    @AppStorage("desktopWidgets.note") private var note = ""
    @FocusState private var editing: Bool

    var body: some View {
        ZStack(alignment: .topLeading) {
            TextEditor(text: $note)
                .focused($editing)
                .font(.system(size: 14))
                .scrollContentBackground(.hidden)
                .foregroundStyle(.white)
                .accessibilityLabel("Quick Note")
                .onChange(of: note) { _, value in
                    if value.count > 10_000 { note = String(value.prefix(10_000)) }
                }
            if note.isEmpty {
                Text("Write a quick note…")
                    .font(.system(size: 14)).foregroundStyle(.secondary)
                    .padding(.horizontal, 5).padding(.top, 5)
                    .allowsHitTesting(false).accessibilityHidden(true)
            }
        }
        .padding(12)
        .modifier(IslandWidgetEditingHold(focused: editing, utility: .note))
    }
}

struct IslandTasksWidget: View {
    private struct Entry: Codable, Identifiable {
        var id = UUID()
        var title: String
        var done = false
    }

    @AppStorage("desktopWidgets.tasks") private var stored = Data()
    @State private var draft = ""
    @FocusState private var editing: Bool

    private var entries: [Entry] { (try? JSONDecoder().decode([Entry].self, from: stored)) ?? [] }
    private var canAdd: Bool { !draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && entries.count < 100 }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                TextField("Add a task", text: $draft)
                    .focused($editing)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit(add)
                Button(action: add) {
                    Image(systemName: "plus").frame(width: 27, height: 26).contentShape(Rectangle())
                }
                .disabled(!canAdd)
                .accessibilityLabel("Add a task").help("Add a task")
            }
            if entries.isEmpty {
                Text("Your tasks stay on this Mac.")
                    .font(.caption).foregroundStyle(.secondary).frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 3) {
                        ForEach(entries) { entry in
                            HStack(spacing: 6) {
                                Toggle(isOn: Binding(get: { entry.done }, set: { value in
                                    update(entry.id) { $0.done = value }
                                })) {
                                    Text(entry.title).strikethrough(entry.done).lineLimit(2)
                                }.toggleStyle(.checkbox)
                                Spacer(minLength: 0)
                                Button(role: .destructive) { save(entries.filter { $0.id != entry.id }) } label: {
                                    Image(systemName: "xmark").font(.system(size: 9, weight: .medium))
                                        .frame(width: 27, height: 27).contentShape(Rectangle())
                                }
                                .buttonStyle(.plain).accessibilityLabel("Remove").help("Remove")
                            }
                        }
                    }
                }
            }
        }
        .padding(12)
        .modifier(IslandWidgetEditingHold(focused: editing, utility: .tasks))
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }

    private func add() {
        guard canAdd else { return }
        save(entries + [Entry(title: String(draft.trimmingCharacters(in: .whitespacesAndNewlines).prefix(240)))])
        draft = ""
    }

    private func update(_ id: UUID, _ edit: (inout Entry) -> Void) {
        var updated = entries
        guard let index = updated.firstIndex(where: { $0.id == id }) else { return }
        edit(&updated[index])
        save(updated)
    }

    private func save(_ entries: [Entry]) {
        if let data = try? JSONEncoder().encode(entries) { stored = data }
    }
}

struct IslandClockWidget: View {
    var body: some View {
        TimelineView(.everyMinute) { timeline in
            VStack(alignment: .leading, spacing: 3) {
                Text(timeline.date.formatted(.dateTime.hour().minute()))
                    .font(.system(size: 34, weight: .medium, design: .rounded).monospacedDigit())
                    .foregroundStyle(.white)
                Text(timeline.date.formatted(.dateTime.month().day().weekday()))
                    .font(.system(size: 12)).foregroundStyle(.secondary)
            }
            .lineLimit(1).minimumScaleFactor(0.75)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .padding(.horizontal, 14)
        }
    }
}

struct IslandCountdownWidget: View {
    @AppStorage("desktopWidgets.countdown.duration") private var minutes = 25
    @AppStorage("desktopWidgets.countdown.deadline") private var deadline = 0.0
    @AppStorage("desktopWidgets.countdown.pausedRemaining") private var pausedRemaining = 0.0
    @State private var expiredDeadline: Double?

    private var shouldTick: Bool {
        deadline.isFinite && deadline > Date().timeIntervalSince1970 && expiredDeadline != deadline
    }

    var body: some View {
        TimelineView(.animation(minimumInterval: 1, paused: !shouldTick)) { timeline in
            let running = deadline > timeline.date.timeIntervalSince1970
            let finished = deadline > 0 && !running
            let seconds = max(0, Int(ceil(running ? deadline - timeline.date.timeIntervalSince1970
                                         : finished ? 0 : pausedRemaining > 0 ? pausedRemaining : Double(minutes * 60))))
            VStack(alignment: .leading, spacing: 5) {
                HStack(spacing: 8) {
                    Text(String(format: "%02d:%02d", seconds / 60, seconds % 60))
                        .font(.system(size: 32, weight: .medium, design: .rounded).monospacedDigit())
                        .foregroundStyle(.white)
                        .accessibilityLabel(L10n.format("CountdownAccessibleTime", seconds / 60, seconds % 60))
                    Spacer(minLength: 0)
                    if finished { Text("Time’s up").font(.caption).foregroundStyle(.secondary) }
                }
                HStack(spacing: 8) {
                    if deadline == 0 && pausedRemaining == 0 {
                        Stepper(value: $minutes, in: 1...60) {
                            Text(L10n.format("CountdownMinutes", minutes))
                                .monospacedDigit()
                        }
                        .fixedSize()
                        .accessibilityLabel("Duration")
                        .accessibilityValue(L10n.format("CountdownMinutes", minutes))
                    }
                    Spacer(minLength: 0)
                    Button(running ? "Pause" : pausedRemaining > 0 ? "Resume" : "Start") {
                        if running {
                            pausedRemaining = max(0, deadline - Date().timeIntervalSince1970)
                            deadline = 0
                        } else {
                            let interval = pausedRemaining > 0 ? pausedRemaining : Double(minutes * 60)
                            deadline = Date().timeIntervalSince1970 + interval
                            pausedRemaining = 0
                        }
                    }
                    Button("Reset") { deadline = 0; pausedRemaining = 0 }
                        .disabled(deadline == 0 && pausedRemaining == 0)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .padding(.horizontal, 14)
        }
        .task(id: deadline) {
            let end = deadline
            let seconds = end - Date().timeIntervalSince1970
            guard seconds.isFinite, seconds > 0, seconds <= 3601 else { return }
            do { try await Task.sleep(for: .seconds(seconds)) } catch { return }
            expiredDeadline = end
        }
    }
}

struct IslandProgressWidget: View {
    var body: some View {
        TimelineView(.everyMinute) { context in
            let calendar = Calendar.current
            VStack(spacing: 8) {
                if let day = calendar.dateInterval(of: .day, for: context.date) {
                    meter("Today", interval: day, now: context.date)
                }
                if let week = calendar.dateInterval(of: .weekOfYear, for: context.date) {
                    meter("This Week", interval: week, now: context.date)
                }
            }
            .padding(.horizontal, 14).padding(.bottom, 10)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }

    private func meter(_ title: String, interval: DateInterval, now: Date) -> some View {
        let fraction = min(1, max(0, now.timeIntervalSince(interval.start) / interval.duration))
        return VStack(spacing: 3) {
            HStack {
                Text(L10n.string(title))
                Spacer()
                Text(fraction, format: .percent.precision(.fractionLength(0))).monospacedDigit()
            }
            .font(.caption)
            ProgressView(value: fraction).labelsHidden().accessibilityLabel(L10n.string(title))
        }
    }
}

struct IslandQuoteWidget: View {
    @AppStorage("desktopWidgets.quotes") private var quotes = ""
    @State private var draft = ""
    @State private var isEditing = false
    @FocusState private var editing: Bool

    private var entries: [String] {
        quotes.split(whereSeparator: \.isNewline)
            .map { String($0).trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            if isEditing {
                Text("One quote per line").font(.caption).foregroundStyle(.secondary)
                TextEditor(text: $draft)
                    .focused($editing)
                    .scrollContentBackground(.hidden).font(.system(size: 12))
                    .accessibilityLabel("Edit Quotes")
                    .onAppear { editing = true }
                HStack {
                    Spacer()
                    Button("Cancel") { isEditing = false }
                    Button("Save") {
                        quotes = String(draft.prefix(4000))
                        isEditing = false
                    }
                }
            } else {
                TimelineView(.periodic(from: .now, by: 60)) { context in
                    let day = Calendar.current.ordinality(of: .day, in: .era, for: context.date) ?? 0
                    Text(entries.isEmpty ? L10n.string("Add your own quotes.")
                         : entries[day % entries.count])
                        .font(.system(size: 15, weight: .medium)).lineLimit(4)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                }
                Button("Edit Quotes") {
                    draft = quotes
                    isEditing = true
                }
                    .font(.caption)
            }
        }
        .padding(12)
        .modifier(IslandWidgetEditingHold(focused: editing, utility: .quote))
    }
}
