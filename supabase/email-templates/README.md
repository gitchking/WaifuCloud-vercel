# 🌸 Waifu Cloud Email Templates

Beautiful, anime-themed email templates for Supabase authentication with engaging emojis and modern design.

## 📧 Templates Included

1. **confirm-signup.html** - Welcome email for new user registration
2. **invite.html** - User invitation email
3. **magic-link.html** - Passwordless login email
4. **recovery.html** - Password reset email
5. **email-change.html** - Email address change confirmation

## 🎨 Design Features

- ✨ **Anime-themed design** with kawaii aesthetics
- 🌸 **Engaging emojis** throughout the content
- 🎌 **Waifu Cloud branding** with pink gradient theme
- 📱 **Responsive design** for all devices
- 🛡️ **Security-focused** messaging
- 💝 **Community-focused** language

## 🚀 How to Implement in Supabase

### Method 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `jhusavzdsewoiwhvoczz`
3. **Navigate to**: Authentication → Email Templates
4. **For each template**:
   - Click on the template type (e.g., "Confirm signup")
   - Replace the default HTML with the content from the corresponding `.html` file
   - Click "Save"

### Method 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref jhusavzdsewoiwhvoczz

# Deploy email templates
supabase db push
```

### Method 3: Manual Configuration

Copy the HTML content from each template file and paste it into the corresponding email template section in your Supabase dashboard:

- `confirm-signup.html` → **Confirm signup** template
- `invite.html` → **Invite user** template  
- `magic-link.html` → **Magic Link** template
- `recovery.html` → **Change email address** template
- `email-change.html` → **Reset password** template

## 🎯 Template Variables

Each template uses Supabase's built-in variables:

- `{{ .ConfirmationURL }}` - The action URL (confirm, reset, etc.)
- `{{ .Token }}` - The confirmation token
- `{{ .Type }}` - The email type
- `{{ .SiteURL }}` - Your site URL

## 🌟 Customization

### Colors
- **Primary Pink**: `#e94560`
- **Secondary Pink**: `#f38ba8`
- **Background Gradient**: `#667eea` to `#764ba2`
- **Text Dark**: `#2d3748`
- **Text Light**: `#4a5568`

### Fonts
- **Primary**: Inter, system fonts
- **Weight**: 400 (normal), 600 (semibold), 700 (bold), 900 (black)

### Emojis Used
- 🌸 Waifu Cloud branding
- 🎌 Japanese/anime theme
- ✨ Magic/sparkle effects
- 💝 Love/heart theme
- 🎯 Action/target
- 🛡️ Security
- 📧 Email
- 🚀 Launch/action

## 📱 Mobile Optimization

All templates are fully responsive and include:
- Flexible layouts for mobile screens
- Touch-friendly button sizes
- Readable font sizes on small screens
- Optimized images and spacing

## 🔒 Security Features

- Clear security messaging
- Expiration time notifications
- Action verification language
- Contact information for issues
- Safe-to-ignore instructions

## 🎨 Brand Consistency

Templates maintain consistency with Waifu Cloud:
- Same color scheme as the main app
- Consistent typography
- Anime/waifu themed language
- Community-focused messaging
- Professional yet playful tone

## 📞 Support

If you need help implementing these templates:
1. Check Supabase documentation: https://supabase.com/docs/guides/auth/auth-email-templates
2. Contact Supabase support for technical issues
3. Customize the templates to match your specific needs

---

Made with 💝 for the Waifu Cloud community! 🌸