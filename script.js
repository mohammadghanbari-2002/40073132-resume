document.addEventListener('DOMContentLoaded', () => {

  const wsProtocol = location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(`${wsProtocol}://${location.host}/ws/`);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    document.querySelector('.online-count').textContent = `Online Users: ${data.online_users}`;
  };

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  const projectForm = document.getElementById('project-form');

  projectForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      title: document.getElementById('title').value.trim(),
      description: document.getElementById('description').value.trim(),
      estimated_budget: document.getElementById('estimated_budget').value.trim(),
      deadline: document.getElementById('deadline').value.trim()
    };
    const errors = [];

    if(formData.name.length < 2 || formData.name.length > 50){
      errors.push("Name must be 2-50 characters");
    }
    if(!/\S+@\S+\.\S+/.test(formData.email)){
      errors.push("Invalid email address");
    }
    if(formData.title.length < 3 || formData.title.length > 100){
      errors.push("Title must be 3-100 characters");
    }
    if(formData.description.length < 10 || formData.description.length > 1000){
      errors.push("Description must be 10-1000 characters");
    }
    if(!formData.estimated_budget){
      errors.push("Estimated budget is required");
    }
    if(!formData.deadline){
      errors.push("Deadline is required");
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0,0,0,0);
      if(isNaN(deadlineDate.getTime())){
        errors.push("Deadline must be a valid date");
      } else if(deadlineDate < today){
        errors.push("Deadline must be in the future");
      }
    }

    if(errors.length > 0){
      alert("Please fix the following errors:\n- " + errors.join("\n- "));
      return;
    }

    fetch('http://127.0.0.1:8000/api/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if(response.ok){
        alert('request submitted successfully!');
        projectForm.reset();
      } else {
        response.json().then(data => {
          alert('Failed to submit  request:\n' + JSON.stringify(data.detail));
        });
      }
    })
    .catch(error => {
      console.error('Error submitting  request:', error);
      alert('An error occurred while submitting your request.');
    });
  });

});
