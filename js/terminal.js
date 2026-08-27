export function initTerminal() {
  const terminal = document.getElementById('ai-terminal');
  if (!terminal) return;

  const input = document.getElementById('ai-input');
  const history = document.getElementById('ai-history');
  const body = document.getElementById('ai-body');
  const btns = document.querySelectorAll('.qb');

  const responses = {
    'help': 'Available commands: about, skills, projects, contact, clear, hackathons, resume',
    'about me': 'I am Amir Choudhary, a Software Development Engineer specializing in real-time graphics (C++ / DirectX 12) and full-stack MERN applications. 900+ DSA problems solved.',
    'about': 'I am Amir Choudhary, a Software Development Engineer specializing in real-time graphics (C++ / DirectX 12) and full-stack MERN applications. 900+ DSA problems solved.',
    'tech stack': 'My core tech stack: React.js, Node.js, Express, MongoDB, C++, DirectX 12, Python.',
    'skills': 'My core tech stack: React.js, Node.js, Express, MongoDB, C++, DirectX 12, Python.',
    'projects': 'Some of my projects include: AshGuard (Women Safety App), Lost & Found Community, Job Portal API. Type a specific project name or scroll up to see them in detail.',
    'hackathons': 'I have participated in multiple hackathons, focusing on building AI-driven solutions and full-stack applications.',
    'resume': 'You can view or download my resume from the top navigation bar or the Hero section!',
    'contact': 'You can reach me at: choudharyamir095@gmail.com, or use the contact form at the bottom of the page.',
    'secret matrix rain': 'Initiating protocol... (Just kidding, but I might add it later! 😎)',
    'clear': 'CLEAR_TERMINAL'
  };

  function appendLine(text, type) {
    if (text === 'CLEAR_TERMINAL') {
      history.innerHTML = '';
      return;
    }
    const div = document.createElement('div');
    div.className = `term-line ${type}`;
    if (type === 'ai-msg') {
      div.innerHTML = `> Amir.AI: ${text}`;
    } else if (type === 'user-msg') {
      div.innerHTML = `<span class="prompt">visitor@amir-ai:~$</span> ${text}`;
    } else {
      div.innerText = text;
    }
    history.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function processCommand(cmd) {
    const cleanCmd = cmd.trim().toLowerCase();
    if (!cleanCmd) return;
    
    appendLine(cmd, 'user-msg');
    
    setTimeout(() => {
      if (cleanCmd === 'clear terminal' || cleanCmd === 'clear') {
        appendLine('CLEAR_TERMINAL');
      } else if (responses[cleanCmd]) {
        appendLine(responses[cleanCmd], 'ai-msg');
      } else {
        appendLine(`Command not found: ${cleanCmd}. Type 'help' to see available commands.`, 'err');
      }
    }, 400);
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      processCommand(input.value);
      input.value = '';
    }
  });

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      processCommand(btn.getAttribute('data-cmd') || btn.innerText);
    });
  });
  
  // Focus input when clicking anywhere in terminal body
  body.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') {
      input.focus();
    }
  });
}
