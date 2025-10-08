# Crazy Mode Theme - GIF Setup Instructions

## How to Add Your Custom GIF Background

The "crazy" theme mode is now set up and ready for your custom GIF! Here's how to add it:

### Step 1: Add Your GIF

Place your chosen GIF file in the `/public` directory and name it `crazy-bg.gif` (or any name you prefer).

### Step 2: Enable the GIF Background

Open `/styles/globals.css` and find line 72. Uncomment the background-image line:

```css
.crazy body {
  /* Optional: Add GIF background overlay */
  background-image: url("/crazy-bg.gif"); /* <-- Uncomment this line */
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}
```

If you used a different filename, update the path accordingly:

```css
background-image: url("/your-gif-name.gif");
```

### Current Setup

The theme toggle is now in the navbar and cycles through:

1. **Light mode** - Default light theme
2. **Dark mode** - Your existing dark theme
3. **Crazy mode** - Animated rainbow gradient background with wild colors

### Features

- **View Transitions API**: Smooth animated transitions between themes
- **Animated gradient**: Rainbow gradient that animates continuously in crazy mode
- **Text effects**: Glowing text shadows in crazy mode
- **Persistent**: Theme choice is saved to localStorage
- **Accessible**: Proper ARIA labels and keyboard support

### Customization Options

You can customize the crazy mode further in `/styles/globals.css`:

- **Colors**: Modify the gradient colors in the `.crazy` class (lines 55-65)
- **Animation speed**: Change the `10s` value in line 67 to speed up/slow down the gradient
- **Text effects**: Adjust text shadows in lines 83 and 90
- **Overlay opacity**: Change the `rgba(0, 0, 0, 0.3)` value in line 97 to make the overlay lighter/darker

### Browser Support

The View Transitions API is supported in:

- Chrome/Edge 111+
- Safari 18+
- Firefox (behind flag)

For unsupported browsers, the theme will still change but without the smooth transition animation.

## Testing

Click the theme toggle button in the navbar (next to the search icon) to cycle through the themes!
