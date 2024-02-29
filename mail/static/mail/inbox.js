document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_mail)

  document.addEventListener('click', event => {
    const element = event.target;

    if (element.className === 'open') {
      element.parentElement.className = 'read email';
      // get id and do a put request to change the read to true
      // use the data attribute for the email id that's passed down
      fetch(`/emails/${element.dataset.email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })

      fetch(`/emails/${element.dataset.email_id}`)
      .then(response => response.json())
      .then(email => {
        console.log(email)
        document.querySelector('#email-view').innerHTML = `
        <h1>${email.subject}</h1>
        <h6>From: ${email.sender}</h6>
        <h6>To: ${email.recipients}</h6>
        <p>Sent: ${email.timestamp}</p>
        <p>${email.body}</p>
        `
      });

      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#email-view').style.display = 'block';


    }
  })
  // By default, load the inbox
  load_mailbox('inbox');
});


if (!localStorage.getItem('sentMail')) {
  localStorage.setItem('sentMail', [])
}

function reset_display() {
  // reset the html to nothing for the email (so it's fresh each time on reload)
  document.querySelector('#email-view').innerHTML = ''

  // hide all views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
}

function compose_email() {
  reset_display()

  // show compose forms
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  reset_display()

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // console.log(`provided mailbox is: ${mailbox}`)
  // load the appropriate mailbox

  // do a get request to the appropriate mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json()) // if doing arrow function, with return one-liner, remove curly braces!
  .then(result => {
    // console.log(result);//also looks like need to refresh browser to see results!
    result.forEach(add_email)
  });

  // generate divs for the emails and return them!
  // relevant section in lecture 6: search get new posts and add posts

}

function add_email(contents) {
  // create a new email
  const email = document.createElement('div')
  // email.innerHTML = contents.subject
  // console.log(contents.sender)

  // depending on the read/unread state, set the className to either
  // read email or
  // unread email
  if (contents.read === true) {
    email.className = 'read email'
  } else {
    email.className = 'unread email'
  }
  email.innerHTML = `from: ${contents.sender} 
  - ${contents.subject} | ${contents.timestamp} <button data-email_id=${contents.id} class="open">open</button>`

  // console.log(email)

  // add to DOM
  document.querySelector('#emails-view').append(email)

}

// [
//     {
//         "id": 100,
//         "sender": "foo@example.com",
//         "recipients": ["bar@example.com"],
//         "subject": "Hello!",
//         "body": "Hello, world!",
//         "timestamp": "Jan 2 2020, 12:00 AM",
//         "read": false,
//         "archived": false
//     },
//     {
//         "id": 95,
//         "sender": "baz@example.com",
//         "recipients": ["bar@example.com"],
//         "subject": "Meeting Tomorrow",
//         "body": "What time are we meeting?",
//         "timestamp": "Jan 1 2020, 12:00 AM",
//         "read": true,
//         "archived": false
//     }
// ]

function send_mail(event) {
  // prevent default stops it from submitting a form and bringing you to a new page!!!
  // refer to 1:09:50 in javascript lecture for something similar since we're doing
  // client side code!
  event.preventDefault()

  // send an email!
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  }).then(response => {
    response.json();
  }).then(result => {
    console.log(result);
    load_mailbox('sent')
  });

}