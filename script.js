 function validarLogin() {
      const email = document.getElementById("email").value.trim();
      const senha = document.getElementById("senha").value.trim();

      
      if (!email.includes("@")) {
        alert("Por favor, insira um email válido contendo '@'.");
        return;
      }
  
      
      if (senha.length < 6) {
        alert("A senha deve ter no mínimo 6 caracteres.");
        return;
      }

    fazerLogin(email,senha)   
    }
 
async function fazerLogin(email, senha) {
    try {
        const response = await fetch('https://sistema47-back.onrender.com/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });
        
        const data = await response.json();

        if (response.status === 200) {
            window.location.href = "dashboard.html";
            return data;
        } else {
            alert(data.message || "Email ou senha inválidos.");
            return data;
        }
    } catch (error) {
        alert("Não foi possível efetuar o login. Verifique sua conexão.");
        return "Algo deu errado com o login.";
    }
}

function validarCadastro() {
  const nome = document.getElementById("nome").value.trim()
  const email = document.getElementById("email").value.trim()
  const senha = document.getElementById("senha").value.trim()
  const senhaConfirma = document.getElementById("confirmar").value.trim()

  if (!email.includes("@")) {
    alert("Por favor, insira um email válido contendo '@'.");
    return;
  }
      
  if (senha.length < 6) {
    alert("A senha deve ter no mínimo 6 caracteres.");
    return;
  }

  if (senha != senhaConfirma) {
    alert("As senhas precisam estar iguais.");
    return;
  }

  fazerCadastro(nome,email,senha)
}

async function fazerCadastro(nome,email,senha) {
  try {
      const response = await fetch('https://sistema47-back.onrender.com/api/usuario', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            nome: nome,
            email: email,
            senha: senha        
          })
      });
      const data = await response.json();
      console.log(data)
      alert("Cadastro efetuado com sucesso!")
      return data;
  } catch (error) {
      alert("Não foi possível efetuar o cadastro.")
      return "Algo deu errado com o cadastro.";
  }
} 