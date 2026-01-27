export const notificationSound = "data:audio/mp3;base64,//uQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";

// Simple Pop Sound (shortened placeholder - normally this would be a real file)
// Since I cannot upload a binary file, I will provide a function that tries to play a file from public/sounds/pop.mp3
// and falls back to a simple browser beep if possible, but actually let's just use the public path standard.

export const playNotificationSound = () => {
    try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed (interaction needed first)', e));
    } catch (error) {
        console.error('Error playing sound', error);
    }
};
