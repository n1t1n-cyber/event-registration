/*
 * init-data.js
 * This script runs FIRST.
 * Its only job is to populate localStorage with default
 * data IF it doesn't exist.
 */

(function () {
    // Define the storage keys
    const ADMIN_KEY = 'eventhub_admins';
    const EVENT_KEY = 'eventhub_events';

    // --- 1. Create Default Admin ---
    function createDefaultAdmin() {
        const admins = JSON.parse(localStorage.getItem(ADMIN_KEY)) || [];
        const defaultAdminExists = admins.some(admin => admin.email === 'admin@eventhub.com');

        if (!defaultAdminExists) {
            admins.push({
                email: 'admin@eventhub.com',
                password: 'password123',
                fullName: 'Default Admin'
            });
            localStorage.setItem(ADMIN_KEY, JSON.stringify(admins));
            console.log('Default admin created.');
        }
    }

    // --- 2. Create Default Events ---
    function createDefaultEvents() {
        const events = JSON.parse(localStorage.getItem(EVENT_KEY)) || [];
        const adminEmail = 'admin@eventhub.com'; // Assign to default admin

        // Merge all your events into one master list
        const defaultEvents = [
            // Your original 3 events
            { id: 'web-dev', title: 'Web Development Workshop', date: '2025-12-10', time: '10:00', location: 'Main Auditorium', description: 'Learn how to build responsive websites using HTML, CSS, and JavaScript.', adminEmail: adminEmail, image: 'images/web_dev_workshop.png' },
            { id: 'ai-ml', title: 'AI & Machine Learning Meetup', date: '2025-11-20', time: '14:00', location: 'Room 204', description: 'A meetup for AI enthusiasts to share ideas and innovations.', adminEmail: adminEmail, image: 'images/Ai_ML_workshop.jpg' },
            { id: 'startup', title: 'Startup Networking Session', date: '2025-12-05', time: '18:00', location: 'College Grounds', description: 'Connect with entrepreneurs and investors to grow your startup ideas.', adminEmail: adminEmail, image: 'images/networking.png' },
            
            // Your 10 events from explore.html
            { id: 'evt_1', title: "AI & Machine Learning Expo", description: "Keynotes on Generative AI, MLOps, and Large Language Models.", date: "2025-10-25", time: "09:00", location: "San Francisco, CA (Hybrid)", adminEmail: adminEmail, image: "https://picsum.photos/400/200?random=1" },
            { id: 'evt_2', title: "Full-Stack Dev Conference", description: "Modern web architecture with React, Node.js, and serverless backends.", date: "2025-11-12", time: "09:00", location: "Virtual & Seattle, WA", adminEmail: adminEmail, image: "https://picsum.photos/400/200?random=2" },
            { id: 'evt_3', title: "Cloud Security Summit 2025", description: "Protecting data in multi-cloud environments (AWS, GCP, Azure).", date: "2025-12-03", time: "09:00", location: "London, UK (Online)", adminEmail: adminEmail, image: "https://picsum.photos/400/200?random=3" },
            { id: 'evt_4', title: "DevOps and SRE Bootcamp", description: "Continuous Integration/Deployment (CI/CD) and site reliability engineering.", date: "2026-01-15", time: "09:00", location: "Austin, TX", adminEmail: adminEmail, image: "https://picsum.photos/400/200?random=4" },
            { id: 'evt_5', title: "UX/UI Design Masterclass", description: "Designing intuitive and accessible digital products.", date: "2026-02-01", time: "09:00", location: "Online Workshop", adminEmail: adminEmail, image: "https://picsum.photos/400/200?random=5" },
            { id: 'evt_6', title: "Quantum Computing Pioneers", description: "Exploring superconducting qubits and quantum algorithms.", date: "2026-03-01", time: "09:00", location: "Boston, MA", adminEmail: adminEmail, image: "https://picsum.photos/400/200?random=6" },
            { id: 'evt_7', title: "Mobile App Innovation Day", description: "Latest in native (iOS/Android) and cross-platform (Flutter/React Native) development.", date: "2026-04-10", time: "09:00", location: "Virtual Event", adminEmail: adminEmail, image: "https://picsum.photos/400/200?random=7" },
            { id: 'evt_8', title: "Big Data & Analytics Forum", description: "Harnessing the power of petabytes with Hadoop, Spark, and data lakes.", date: "2026-05-22", time: "09:00", location: "Chicago, IL", adminEmail: adminEmail, image: "https://picsum.photos/400/200?random=8" },
            { id: 'evt_9', title: "Embedded Systems Workshop", description: "From IoT sensors to real-time operating systems (RTOS).", date: "2026-06-06", time: "09:00", location: "Silicon Valley, CA", adminEmail: adminEmail, image: "https://picsum.photos/400/200?random=9" },
            { id: 'evt_10', title: "Cyber Warfare Defense", description: "Current threat landscapes, penetration testing, and incident response.", date: "2026-07-19", time: "09:00", location: "Washington, D.C.", adminEmail: adminEmail, image: "https://picsum.photos/400/200?random=10" }
        ];

        // Only add events if the list is empty
        if (events.length === 0) {
            localStorage.setItem(EVENT_KEY, JSON.stringify(defaultEvents));
            console.log('Default events created.');
        }
    }

    // --- 3. Run Initialization ---
    createDefaultAdmin();
    createDefaultEvents();

})();