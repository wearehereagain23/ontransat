function showSpinnerModal() {
  document.getElementById('spinnerModal').style.display = 'flex';
}

function hideSpinnerModal() {
  document.getElementById('spinnerModal').style.display = 'none';
}

const notifyBtn = document.getElementById('notifyBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const notificationList = document.getElementById('notificationList');
const loadMoreBtn = document.getElementById('loadMoreBtn');

let offset = 0;
const limit = 5;
let xdata = null

let refCode1 = Math.floor(Math.random() * 1795);
let refCode2 = Math.floor(Math.random() * 1905);
let refCode3 = Math.floor(Math.random() * 3725);
window.refCode = `Rw${refCode1}/Xhc${refCode2}FVk/${refCode3}`


function formatCurrency(amount, locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
  }).format(amount);
}

showSpinnerModal()


//sign out function
async function signOutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log('Error signing out:', error.message);
  } else {
    console.log('User signed out successfully');
    window.location.href = "../index.html";
  }
}



async function fetchUserData() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Network Error getting session:', error.message);
  } else {
    const user = data.session?.user;
    showSpinnerModal();
    if (data.session == null) {
      signOutUser();
    } else {
      window.userUuid = user.id;
      const { data, error } = await supabase
        .from('onlinbanking')
        .select('*')
        .eq('uuid', user.id);
      if (error) {
        alert('Error fetching user data:', error);
        hideSpinnerModal();
      } else {
        //check if the user still have data
        if (data.length == 0) {
          signOutUser();
        }

        //checking if user is active 
        data.forEach(doc => {
          window.xdata = doc;

          if (doc.activeuser == "inactive") {
            hideSpinnerModal()
            Swal.fire({
              background: '#0C290F',
              confirmButtonColor: 'green',
              customClass: {
                popup: 'swal2Style',
                inputLabel: 'swal2StyleTEXT'
              },
              title: 'YOUR ACCOUNT IS CURRENTLY INACTIVE',
              text: "Please contact our customer-service for your account re-activation",
              icon: 'warning',
              showCancelButton: false,
              confirmButtonText: 'OK!'
            }).then((result) => {
              if (result.isConfirmed) {
                signOutUser();
              } else if (result.isDismissed) {
                signOutUser();
              }
            });
          } else {

            // User is active
            window.dataBase = doc;
            // document.getElementById('noteCounte').innerHTML = doc.notificationCount;

            ///EMAIL SENDING 

            // Init EmailJS
            (function () {
              emailjs.init("2Q4WecyOOedzPTRMh"); // <-- replace with your EmailJS public key
            })();

            const modal = document.getElementById("contactModal");
            const emailBtn = document.getElementById("emailBtn");
            const closeModal = document.getElementById("closeModal");
            const cancelBtn = document.getElementById("cancelBtn");
            const form = document.getElementById("contactForm");

            emailBtn.onclick = () => modal.style.display = "flex";
            closeModal.onclick = () => modal.style.display = "none";
            cancelBtn.onclick = () => modal.style.display = "none";
            window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };


            form.addEventListener("submit", function (e) {
              e.preventDefault();
              // Send email via EmailJS

              const templateParams = {
                subject: document.getElementById("subject").value,
                message: document.getElementById("message").value,
                name: doc.firstname,
                time: new Date().toLocaleString(),
              };

              emailjs.send("service_96ggq4b", "template_xjlc6q6", templateParams)
                .then(() => {
                  Swal.fire({
                    title: "✅ Message Sent!",
                    html: `
          <p style="font-size:16px; color:white;">
            Thank you for contacting <strong>Customer Care</strong>.<br>
            Your message has been received and one of our support agents will get back to you shortly.<br><br>
            <em>We usually reply within 24 hours.</em>
          </p>
        `,
                    icon: "success",
                    confirmButtonText: "Great!",
                    background: '#0C290F',
                    textColor: 'white',
                    denyButtonColor: 'green',
                    confirmButtonColor: 'green',
                    customClass: {
                      popup: 'swal2Style'
                    },
                  });
                  modal.style.display = "none";
                  form.reset();
                }, (err) => {
                  alert("❌ Failed to send. Please try again.");
                  console.error("EmailJS Error:", err);
                });
            });



            setTimeout(() => {
              hideSpinnerModal();
            }, 1000);

          }
        });
      }


      document.getElementById('logout').addEventListener('click', () => {
        signOutUser();
      })

    }
  }

} fetchUserData();





// Toggle dropdown
notifyBtn.addEventListener('click', () => {
  document.getElementById('noteCounte').innerHTML = '0';
  dropdownMenu.classList.toggle('active');
  if (dropdownMenu.classList.contains('active') && offset === 0) {
    loadNotifications();
  }
});

// Close dropdown if clicked outside
document.addEventListener('click', (e) => {
  if (!notifyBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.classList.remove('active');
  }
});

// Load notifications from Supabase
async function loadNotifications() {
  const { data, error } = await supabase
    .from("onlinbankinNotification") // 👈 your table name
    .select("*")
    .eq('uuid', dataBase.uuid)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error(error);
    return;
  }

  data.forEach(item => {
    const li = document.createElement("li");

    li.innerHTML = `
          <div class="notif-title">${item.title}</div>
          <div class="notif-message">${item.message}</div>
        `;

    notificationList.appendChild(li);
  });

  async function resetNoteCount() {
    const { data, error } = await supabase
      .from('onlinbanking')
      .update({
        notificationCount: '0',

      })
      .eq('uuid', dataBase.uuid);
    if (error) {
      console.error('Error updating data:', error);
    }
  } resetNoteCount();

  offset += limit;

  // If fewer results returned than limit → hide "Load More"
  if (data.length < limit) {
    loadMoreBtn.style.display = "none";
  }
}


// Load more on button click
loadMoreBtn.addEventListener("click", loadNotifications);


/////////////////////////
document.getElementById('openDeposit').addEventListener('click', async () => {

  Swal.fire({
    background: '#0C290F',
    showConfirmButton: false,
    width: 600,
    html: `
            <div class="popup-container">
              <h2>Bank Deposit Details</h2>
              <p>Please deposit to the account below. Tap the copy icon to copy details.</p>

              <div class="info-block">
                <div class="info-content">
                  <span class="info-label">Bank Name</span>
                  <span class="info-value" id="bankName">OnlinBankin</span>
                </div>
                <button class="copy-btn" onclick="copyText('bankName')">📋</button>
              </div>

              <div class="info-block">
                <div class="info-content">
                  <span class="info-label">Account Holder</span>
                  <span class="info-value" id="accountHolder">${dataBase.firstname} ${dataBase.middlename} ${dataBase.lastname}</span>
                </div>
                <button class="copy-btn" onclick="copyText('accountHolder')">📋</button>
              </div>

              <div class="info-block">
                <div class="info-content">
                  <span class="info-label">Account Number</span>
                  <span class="info-value" id="accountNumber">${dataBase.accountNumber}</span>
                </div>
                <button class="copy-btn" onclick="copyText('accountNumber')">📋</button>
              </div>
            </div>
          `,
    didOpen: () => {
      // Reattach copy functions inside the popup
      window.copyText = function (id) {
        const text = document.getElementById(id).textContent;
        navigator.clipboard.writeText(text).then(() => {
          Swal.fire({
            toast: true,
            icon: 'success',
            title: `Copied: ${text}`,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500
          });
        });
      };
    }
  });

});


document.getElementById('Trans2').addEventListener('click', () => {
  // Show confirmation dialog

  Swal.fire({
    title: "Transfer Type",
    background: '#0C290F',
    textColor: 'white',
    showDenyButton: true,
    denyButtonColor: 'green',
    confirmButtonColor: 'green',
    confirmButtonText: "Local Transfer",
    denyButtonText: `International Transfer`,
    customClass: {
      popup: 'swal2Style'
    },
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      window.location.href = "./local.html";
    } else if (result.isDenied) {
      window.location.href = "./international.html";
    }
  });
});

document.getElementById('Trans3').addEventListener('click', () => {
  // Show confirmation dialog

  Swal.fire({
    title: "Transfer Type",
    background: '#0C290F',
    textColor: 'white',
    showDenyButton: true,
    denyButtonColor: 'green',
    confirmButtonColor: 'green',
    confirmButtonText: "Local Transfer",
    denyButtonText: `International Transfer`,
    customClass: {
      popup: 'swal2Style'
    },
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      window.location.href = "./local.html";
    } else if (result.isDenied) {
      window.location.href = "./international.html";
    }
  });
});

document.getElementById('goLoan').addEventListener('click', () => {
  window.location.href = "loan.html";
});
document.getElementById('cards').addEventListener('click', () => {
  window.location.href = "cards.html";
});