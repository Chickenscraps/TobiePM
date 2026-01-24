# Video Review Portal Specification

**Version:** 1.0  
**Date:** January 23, 2026  
**Status:** Specification (Future Implementation)

---

## Overview

The **Video Review Portal** is an integrated feature that allows clients and team members to review video deliverables and provide time-coded feedback in a streamlined, AI-assisted workflow. This eliminates back-and-forth email chains and provides a centralized, auditable review process.

### Key Features

- **Seamless Video Playback**: Web-based video player with timeline controls
- **Time-Coded Comments**: Frame-accurate feedback tied to specific timestamps
- **AI Chat Assistant**: Natural language feedback capture via AI
- **Version Control**: Track multiple video versions with comment history
- **Scope Detection**: AI flags out-of-scope requests during review
- **Automated Transcripts**: Exportable summary of all feedback
- **Secure Access**: Client-specific links with permission isolation

---

## User Flows

### Flow 1: Uploading a Video (Team Member)

```
1. User navigates to Project X > Videos tab
2. Click "Upload Video" button
3. Select file (MP4, MOV, etc.), add title and version number
4. Upload progresses (to Supabase storage)
5. Video appears in project with status "PENDING"
6. User marks status as "UNDER_REVIEW"
7. System generates shareable review link
```

### Flow 2: Client Video Review with AI Assistant

```
1. Client receives email with review link
2. Client logs in (or uses secure token)
3. Video Review Portal loads with:
   - Video player (center)
   - Comment timeline (below video)
   - AI chat assistant (sidebar)
4. Client watches video, pauses at 0:45
5. Client types in AI chat: "The logo should appear earlier here"
6. AI responds: "Noted: Logo timing adjustment at 0:45. I'll add that to the feedback list."
7. Comment appears on timeline with timestamp [0:45]
8. Client continues review, using AI to capture more feedback
9. At end, client clicks "Submit Review"
10. System generates transcript and notifies team
```

### Flow 3: AI Scope Detection

```
1. Client in review session at 1:30 in video
2. Client types: "Can we add a 3D animation of our logo flying in?"
3. AI analyzes against project scope document
4. AI detects: OUT_OF_SCOPE (3D animations not included)
5. AI responds: "That looks like a significant addition. I'll note your request, but please be aware this change isn't covered in the current project scope."
6. Comment is flagged with `isOutOfScope: true`
7. System sends notification to admin: "Client X made an out-of-scope request"
8. Admin can follow up separately
```

### Flow 4: Team Reviewing Feedback

```
1. Designer (Ann) receives notification: "New review feedback on Project X v2"
2. Ann opens Video Review Portal
3. Sees timeline with all comments marked
4. Clicks "Export Transcript" → Downloads markdown file:
   * 00:45 – Logo should appear sooner.
   * 01:10 – Change background color. [OUT-OF-SCOPE: flagged]
   * 01:50 – Typo in subtitle: change 'recieve' to 'receive'.
5. Ann creates sub-tasks from feedback items
6. After implementing changes, uploads v3, marks v2 comments as "Resolved"
```

---

## Technical Specification

### Database Schema

**VideoAsset Model**:
```prisma
model VideoAsset {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  title       String
  version     Int      @default(1)
  fileUrl     String   // Supabase storage URL
  thumbnailUrl String? // Optional thumbnail
  duration    Float?   // Duration in seconds
  status      String   @default("PENDING") // PENDING, UNDER_REVIEW, APPROVED
  comments    VideoComment[]
  createdBy   String
  creator     User     @relation(fields: [createdBy], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([projectId])
  @@index([status])
  @@unique([projectId, version]) // Prevent duplicate versions
}
```

**VideoComment Model**:
```prisma
model VideoComment {
  id          String   @id @default(cuid())
  videoId     String
  video       VideoAsset @relation(fields: [videoId], references: [id], onDelete: Cascade)
  timestamp   Float    // Time in seconds (e.g., 45.5 for 0:45.5)
  content     String   // The feedback text
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  isOutOfScope Boolean @default(false) // AI-flagged
  resolved    Boolean  @default(false)
  resolvedBy  String?
  resolver    User?    @relation("ResolvedBy", fields: [resolvedBy], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([videoId])
  @@index([authorId])
  @@index([timestamp]) // For timeline queries
}
```

### API Endpoints

**Video Management**:
```typescript
POST   /api/projects/:id/videos        // Upload video
GET    /api/projects/:id/videos        // List videos
GET    /api/videos/:id                 // Get video details + comments
PATCH  /api/videos/:id                 // Update video metadata
DELETE /api/videos/:id                 // Delete video (admin only)
```

**Comments**:
```typescript
POST   /api/videos/:id/comments        // Add comment
GET    /api/videos/:id/comments        // List comments
PATCH  /api/comments/:id               // Update comment (resolve, etc.)
DELETE /api/comments/:id               // Delete comment (author only)
```

**Transcripts**:
```typescript
GET    /api/videos/:id/transcript      // Generate markdown transcript
```

**AI Assistant** (during review):
```typescript
POST   /api/videos/:id/ai-chat         // Chat with AI during review
// Body: { message: "Logo should be earlier", currentTimestamp: 45.5 }
// Response: { reply: "Noted...", commentCreated: { id, timestamp, content } }
```

### File Storage (Supabase)

**Bucket Structure**:
```
tobie-videos/
  ├── project_abc/
  │   ├── v1_original.mp4
  │   ├── v2_revised.mp4
  │   └── thumbnails/
  │       ├── v1_thumb.jpg
  │       └── v2_thumb.jpg
```

**Upload Flow**:
1. Client requests signed upload URL from backend
2. Backend generates Supabase signed URL (with size/type validation)
3. Client uploads directly to Supabase (progress tracking)
4. On success, backend creates `VideoAsset` record with `fileUrl`

**Security**:
- Row-level security on Supabase bucket (authenticated users only)
- Signed URLs with expiration (1 hour)
- File size limit: 500 MB per video (configurable)
- Allowed formats: MP4, MOV, WEBM

---

## UI Components

### VideoPlayer Component

**Features**:
- HTML5 `<video>` element with custom controls
- Play/pause, seek, volume, fullscreen
- Timeline overlay showing comment markers
- Click-to-add-comment functionality

**Libraries**: Consider using `react-player` or custom implementation

### CommentTimeline Component

**Display**:
- Horizontal timeline below video
- Markers at comment timestamps (color-coded by status)
- Hover to preview comment
- Click to jump to timestamp

### AIReviewAssistant Component

**Chat Interface**:
- Sidebar chat UI (collapsible on mobile)
- Displays AI messages and user input
- Context-aware: knows current video timestamp
- Buttons for common actions: "Flag as out-of-scope", "Convert to task"

### TranscriptExport Component

**Features**:
- Generates markdown or PDF of all comments
- Grouped by timestamp or category
- Highlights out-of-scope items
- Copy-to-clipboard or download

---

## AI Integration

### AI Feedback Capture

When user chats with AI during review:

```typescript
// Pseudocode
async function handleAIChat(videoId: string, userMessage: string, timestamp: number) {
  // 1. Load video and project context
  const video = await db.videoAsset.findUnique({ where: { id: videoId }, include: { project: true } });
  const scopeDoc = video.project.scopeDocument;
  
  // 2. Construct prompt
  const prompt = `
    You are assisting with video review. Current timestamp: ${formatTime(timestamp)}
    
    User says: "${userMessage}"
    
    Tasks:
    1. Interpret the feedback
    2. Check if it's within scope (scope doc: ${scopeDoc})
    3. Create a concise comment for the timeline
    4. Respond politely to the user
  `;
  
  // 3. Call AI
  const aiResponse = await aiAgent.chat(prompt);
  
  // 4. Parse AI output
  const { comment, isOutOfScope, reply } = aiResponse;
  
  // 5. Create comment in database
  const dbComment = await db.videoComment.create({
    data: {
      videoId,
      timestamp,
      content: comment,
      authorId: currentUser.id,
      isOutOfScope
    }
  });
  
  // 6. If out of scope, notify admin
  if (isOutOfScope) {
    await notifyAdmin(video.projectId, `Out-of-scope request: ${comment}`);
  }
  
  // 7. Return to user
  return { reply, commentCreated: dbComment };
}
```

### Scope Detection Logic

See [AI_AGENT_DESIGN.md](./AI_AGENT_DESIGN.md#scope-detection--out-of-scope-handling) for detailed scope detection architecture.

**Simplified Example**:
```typescript
async function checkScope(request: string, scopeDoc: string): Promise<ScopeCheckResult> {
  const prompt = `
    Project Scope:
    ${scopeDoc}
    
    User Request:
    ${request}
    
    Is this request within scope? Respond: IN_SCOPE, OUT_OF_SCOPE, or UNCLEAR
  `;
  
  const result = await aiModel.analyze(prompt);
  return result; // { status: "OUT_OF_SCOPE", reason: "3D animations not included" }
}
```

---

## Transcript Generation

### Format Example

**Markdown Output**:
```markdown
# Video Review Transcript
**Project**: Acme Corp Explainer  
**Video**: Version 2  
**Date**: January 23, 2026  
**Reviewed by**: John Doe (Client)

---

## Feedback Summary

### In-Scope Changes (3)

- **[00:45]** Logo should appear sooner.  
  *Status*: Unresolved

- **[01:50]** Typo in subtitle: change 'recieve' to 'receive'.  
  *Status*: Unresolved

- **[02:15]** Background music too loud.  
  *Status*: Resolved (v3)

### Out-of-Scope Requests (1)

- **[01:10]** Add 3D animation of logo flying in.  
  *AI Note*: This request is outside the current project scope (3D animations not included).  
  *Status*: Flagged for admin review

---

## Next Steps

1. Address in-scope changes (Items 1-3)
2. Follow up with client on out-of-scope request (Item 4)
3. Upload Version 3 for re-review
```

### Export Options

- **Markdown**: Plain text, easy to copy/paste
- **PDF**: Formatted document for clients
- **JSON**: Structured data for automation

---

## Version Control & Workflow

### Version Lifecycle

1. **Version 1 Uploaded**: Status = PENDING
2. **Mark for Review**: Status = UNDER_REVIEW
3. **Feedback Collected**: Comments added
4. **Changes Made**: Upload Version 2
5. **Mark v1 Comments as Resolved**: Links comments to new version
6. **Repeat**: Until Status = APPROVED

### Comment Resolution

- When new version uploaded, prompt: "Resolve comments from previous version?"
- Designer can mark comments as "Resolved in v2"
- Clients can verify resolutions

---

## Mobile Responsiveness

### Mobile View Adaptations

**Video Player**:
- Full-width on mobile
- Touch-friendly controls (larger buttons)
- Tap timeline to seek

**Comments**:
- Vertical list below video (not side-by-side)
- Swipeable comment cards

**AI Assistant**:
- Collapsible bottom sheet (slides up when tapped)
- Voice input option for mobile users

---

## Security & Privacy

### Access Control

**Permission Levels**:
- **Admin**: Full access to all videos
- **Team Member**: Access to project videos they're assigned to
- **Client**: Only videos for their specific project(s)

**Client Isolation**:
- Clients cannot see other clients' projects
- URL includes unique token: `/review/video_123?token=abc...`
- Token expires after 30 days (configurable)

**Watermarking** (Future):
- Optional video watermark with client name
- Prevents unauthorized sharing

### Rate Limiting

- Max 100 comments per video per user
- Prevents spam/abuse

---

## Future Enhancements

### Phase 1 (MVP)
- [x] Video upload
- [x] Time-coded comments
- [x] AI chat assistant
- [x] Basic transcript export

### Phase 2
- [ ] Drawing annotations on frames (arrows, highlights)
- [ ] Comment threading (replies to comments)
- [ ] @mentions in comments
- [ ] Email notifications for new comments

### Phase 3
- [ ] Version comparison (side-by-side)
- [ ] Integration with editing tools (Premiere Pro, DaVinci Resolve)
- [ ] Advanced AI features (auto-detect changes between versions)
- [ ] Mobile app for on-the-go reviews

---

## Implementation Checklist

### Backend
- [ ] Database schema (VideoAsset, VideoComment)
- [ ] API endpoints (upload, comment, transcript)
- [ ] Supabase storage integration
- [ ] AI chat endpoint
- [ ] Scope detection logic
- [ ] Notification system

### Frontend
- [ ] Video upload UI
- [ ] Video player component
- [ ] Comment timeline component
- [ ] AI chat sidebar
- [ ] Transcript export feature
- [ ] Mobile responsive layouts

### Testing
- [ ] Upload various video formats
- [ ] Comment at different timestamps
- [ ] AI scope detection accuracy
- [ ] Client permission isolation
- [ ] Export transcript formats

---

## References

- [Comprehensive Plan](../Project%20Management%20Dashboard%20with%20Integrated%20AI%20–%20Comprehensive%20Plan.txt) - Lines 27-39 (Video Review Portal section)
- [PRD](./PRD.md) - User stories US-60 through US-66
- [AI_AGENT_DESIGN](./AI_AGENT_DESIGN.md) - Scope detection architecture  
- Industry Tools: Frame.io, Wipster, Filestage (for feature inspiration)

---

**Approval**:
- [ ] Josh approves Video Review Specification
- [ ] Ready for Phase 6 implementation
