const url = window.location.search;
const urldata = new URLSearchParams(url);
const a = urldata.get("i");
const note = urldata.get("note");

let subscriptions = [];

// Fetch subscriptions from Supabase
async function getSubers() {
    const { data, error } = await supabase
        .from('OnlinBankinsubscribers')
        .select('*')
        .eq('uuid', a);

    if (error) {
        console.error('Error fetching data:', error);
    } else {
        subscriptions = data.map(doc => ({
            uuid: doc.uuid,
            subscription: doc.subscribers // column in your table
        }));

        console.log("✅ Parsed subscriptions:", subscriptions);
    }
}
getSubers();


// Handle "Send Notification" button click
document.getElementById("notifyBtn").addEventListener("click", async () => {
    if (!subscriptions.length) {
        alert("No subscribers found yet!");
        return;
    }

    // const title = document.getElementById("titleInput").value || "📢 Default Title";
    const message = document.getElementById("messageInput").value || "Default notification message";

    console.log("Sending notifications to all subscribers...");

    try {
        // Send each subscription to server
        for (const sub of subscriptions) {
            const res = await fetch("/subscribe", {
                method: "POST",
                body: JSON.stringify({
                    subscription: sub.subscription,
                    uuid: sub.uuid,
                    message
                }),
                headers: { "content-type": "application/json" }
            });

            if (!res.ok) throw new Error(`Server error: ${res.status}`);
        }

        console.log("✅ Notifications sent to all subscribers!");

        // Save notification log
        const { error } = await window.supabase
            .from('onlinbankinNotification')
            .insert({
                message,
                uuid: a
            });

        if (error) {
            alert('Something went wrong, please contact developer');
        } else {
            let total = Number(note) + 1;
            const { data, error } = await supabase
                .from('onlinbanking')
                .update({
                    notificationCount: total,

                })
                .eq('uuid', a);
            if (error) {
                console.error('Error updating data:', error);
            } else {
                alert('Notification sent to all devices!');
                // document.getElementById("titleInput").value = "";
                document.getElementById("messageInput").value = "";
            }

        }
    } catch (err) {
        console.error("❌ Failed to send notification:", err);
        alert("❌ Failed to send notification, check console");
    }
});


// Helper: Convert base64 → Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}
