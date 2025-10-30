# Markdown-Style Links in Credit Field

## Feature

Embed clickable links within text using Markdown syntax in the credit field.

---

## How to Use

### Format

```
[Display Text](URL)
```

### Examples

**Example 1: Artist Name as Link**
```
Input:  [John Doe](https://pixiv.net/users/12345)
Output: John Doe (clickable, opens https://pixiv.net/users/12345)
```

**Example 2: Multiple Links**
```
Input:  Art by [John Doe](https://pixiv.net/users/12345) from [Pixiv](https://pixiv.net)
Output: Art by John Doe from Pixiv (both clickable)
```

**Example 3: Mixed Text and Links**
```
Input:  Original artwork by [Artist Name](https://example.com/artist)
Output: Original artwork by Artist Name (Artist Name is clickable)
```

**Example 4: Plain URL (Still Works)**
```
Input:  https://pixiv.net/artworks/12345
Output: https://pixiv.net/artworks/12345 (clickable)
```

**Example 5: Plain Text (No Link)**
```
Input:  Artist: John Doe
Output: Artist: John Doe (plain text, not clickable)
```

---

## Visual Result

### On Watch Page

**Input:**
```
[Sakimichan](https://www.patreon.com/sakimichan)
```

**Display:**
```
Credit / Source
Sakimichan  ← This is blue and clickable
```

**Input:**
```
Art by [John Doe](https://pixiv.net/users/123) - Commission
```

**Display:**
```
Credit / Source
Art by John Doe - Commission
       ↑ Only this part is clickable
```

---

## Features

✅ **Markdown Syntax** - Use `[text](url)` format
✅ **Multiple Links** - Support multiple links in one field
✅ **Mixed Content** - Combine text and links
✅ **Fallback** - Plain URLs still work
✅ **Plain Text** - Regular text displays normally
✅ **No URL Visible** - Only display text shows, URL is hidden
✅ **Secure** - Opens in new tab with security attributes

---

## Use Cases

### 1. Artist Attribution
```
[Sakimichan](https://www.patreon.com/sakimichan)
```
Shows: **Sakimichan** (clickable)

### 2. Multiple Sources
```
[Pixiv](https://pixiv.net/artworks/123) | [Twitter](https://twitter.com/artist/status/456)
```
Shows: **Pixiv** | **Twitter** (both clickable)

### 3. Descriptive Links
```
Original art by [John Doe](https://example.com)
```
Shows: Original art by **John Doe** (John Doe is clickable)

### 4. Commission Info
```
Commissioned from [Artist Name](https://artistsite.com) - Personal use only
```
Shows: Commissioned from **Artist Name** - Personal use only

---

## Technical Details

### Parsing Logic

1. **Check for Markdown links** `[text](url)`
   - Extract text and URL
   - Create clickable link with text

2. **If no Markdown links found:**
   - Check for plain URLs `https://...`
   - Make URLs clickable

3. **Otherwise:**
   - Display as plain text

### Regex Pattern

```javascript
const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
```

Matches:
- `[` - Opening bracket
- `([^\]]+)` - Capture text (anything except `]`)
- `]` - Closing bracket
- `(` - Opening parenthesis
- `([^)]+)` - Capture URL (anything except `)`)
- `)` - Closing parenthesis

### Security

All links include:
```html
target="_blank"           <!-- Opens in new tab -->
rel="noopener noreferrer" <!-- Prevents security issues -->
```

---

## Examples in Action

### Upload Page

**Input Field:**
```
Placeholder: e.g., [Artist Name](https://pixiv.net/artworks/12345)
Helper: Use [Text](URL) format to make text clickable
```

### Watch Page Display

**Example 1:**
```
Input:  [Sakimichan](https://patreon.com/sakimichan)
Shows:  Sakimichan  ← Blue, underlined on hover, clickable
```

**Example 2:**
```
Input:  Art by [John](https://example.com) and [Jane](https://example2.com)
Shows:  Art by John and Jane  ← Both names clickable
```

**Example 3:**
```
Input:  https://pixiv.net/artworks/12345
Shows:  https://pixiv.net/artworks/12345  ← Full URL clickable
```

---

## Comparison

### Before (Plain URL)
```
Input:  https://pixiv.net/artworks/123456789
Display: https://pixiv.net/artworks/123456789 (long, ugly)
```

### After (Markdown Link)
```
Input:  [View on Pixiv](https://pixiv.net/artworks/123456789)
Display: View on Pixiv (clean, professional)
```

---

## Tips

### ✅ Good Examples

```
[Artist Name](https://pixiv.net/users/12345)
[View Original](https://twitter.com/artist/status/123)
Art by [John Doe](https://example.com)
[Pixiv](https://pixiv.net) | [Twitter](https://twitter.com)
```

### ❌ Common Mistakes

```
[Artist Name] (https://example.com)  ← Space between ] and (
[Artist Name(https://example.com)]   ← Wrong bracket placement
Artist Name(https://example.com)     ← Missing [ ]
```

---

## Browser Compatibility

✅ All modern browsers
✅ Mobile browsers
✅ Screen readers (accessible)

---

## Future Enhancements

Possible improvements:
- [ ] Visual editor for creating links
- [ ] Link preview on hover
- [ ] Validate URLs
- [ ] Support for other Markdown syntax (bold, italic)
- [ ] Auto-suggest format when pasting URLs

---

## Summary

**Format:** `[Display Text](URL)`
**Result:** Only "Display Text" shows, and it's clickable
**Fallback:** Plain URLs and text still work
**Where:** Upload page, Admin page, Watch page

**Example:**
```
Input:  [Sakimichan](https://patreon.com/sakimichan)
Output: Sakimichan ← Clickable, no URL visible
```

Clean, professional, and user-friendly! ✨
