# Lumina 📸✨

**Lumina** is a modern, private social platform for collecting and sharing event memories in high quality. Perfect for weddings, parties, and special gatherings where you want to keep photos safe, organized, and away from public social media.

![Lumina Screenshot](public/logo.png)

## 🚀 Features

- **🔒 Private & Secure**: Albums are only accessible via unique links or QR codes.
- **💒 Wedding Ready**: Specialized landing page and flows for couples.
- **💸 Monetization Built-in**: Integrated with **Lemon Squeezy** for one-time payments (PRO Plan).
- **☁️ Cloud Storage**: Powered by Supabase Storage for unlimited 4K photos/videos.
- **📱 Mobile First**: Responsive design that works perfectly on any device without installing an app.
- **📧 Transactional Emails**: Automated welcome and purchase confirmation emails via **Resend**.
- **🌍 Internationalization**: Fully translated into English (EN) and Spanish (ES).
- **⚡ Real-time Updates**: See new photos appear instantly as guests upload them.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons
- **Backend / Database**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Payments**: Lemon Squeezy
- **Emails**: Resend
- **State Management**: Zustand, React Query

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/lumina.git
    cd lumina
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory with your keys:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## ☁️ Supabase Configuration

### Database Schema
The project uses the following tables:
- `profiles`: User data and plan status (`free` / `pro`).
- `albums`: Photo collections.
- `memories`: Individual photo/video entries.
- `memory_media`: Files linked to memories.

### Edge Functions
We use Supabase Edge Functions for webhooks and emails.

1.  **Login to Supabase CLI**:
    ```bash
    npx supabase login
    ```

2.  **Set Secrets**:
    ```bash
    npx supabase secrets set RESEND_API_KEY=re_123...
    npx supabase secrets set LEMON_SQUEEZY_WEBHOOK_SECRET=your_secret
    ```

3.  **Deploy Functions**:
    ```bash
    npx supabase functions deploy send-email --no-verify-jwt
    npx supabase functions deploy lemon-squeezy-webhook --no-verify-jwt
    ```

## 💰 Payments (Lemon Squeezy)

1.  Create a product in Lemon Squeezy ("Event Pass").
2.  Set up a webhook pointing to your Supabase Function URL:
    `https://[project-ref].supabase.co/functions/v1/lemon-squeezy-webhook`
3.  Listen for `order_created` events.

## 📧 Emails (Resend)

We use Resend to send:
- Welcome emails on signup.
- Purchase confirmation emails.
- Support request notifications.

Ensure you have a valid API Key and (optionally) a verified domain.

## 📄 License

This project is proprietary software. All rights reserved.

---

Made with ❤️ by [Jhonathan Chaves](https://github.com/jhonathanchaves)
