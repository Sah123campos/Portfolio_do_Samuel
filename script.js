// Aguarda o carregamento completo da página
document.addEventListener('DOMContentLoaded', function() {
    
    // Inicializa AOS (Animate On Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });
    
    // Menu mobile toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Navegação suave para links internos
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Fecha o menu mobile se estiver aberto
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });
    
    // Funcionalidade de foto de perfil removida - agora a imagem é colocada diretamente no HTML
    
    // Formulário de contato removido - agora usando WhatsApp flutuante
    
    // Sistema de notificações
    function showNotification(message, type = 'info') {
        // Remove notificações existentes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Cria a notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos da notificação
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        // Cores baseadas no tipo
        if (type === 'success') {
            notification.style.background = '#10b981';
        } else if (type === 'error') {
            notification.style.background = '#ef4444';
        } else {
            notification.style.background = '#3b82f6';
        }
        
        // Adiciona ao DOM
        document.body.appendChild(notification);
        
        // Anima a entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove automaticamente após 5 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    // Animação de scroll agora é gerenciada pelo AOS
    
    // Efeito de parallax no header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        const scrolled = window.pageYOffset;
        
        if (header) {
            if (scrolled > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            }
        }
    });
    
    // Atualização dinâmica do ano no footer
    const footerYear = document.querySelector('.footer p');
    if (footerYear) {
        const currentYear = new Date().getFullYear();
        footerYear.innerHTML = footerYear.innerHTML.replace('2024', currentYear);
    }
    
    // Adiciona classe ativa ao link de navegação baseado na seção atual
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-menu a');
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Chama a função no scroll
    window.addEventListener('scroll', updateActiveNavLink);
    
    // Chama uma vez para definir o estado inicial
    updateActiveNavLink();
    
    // Função simples para configurar o WhatsApp
    function setupWhatsAppLink() {
        const whatsappLink = document.querySelector('.whatsapp-float');
        
        if (whatsappLink) {
            console.log('✅ Botão WhatsApp encontrado!');
            console.log('Link atual:', whatsappLink.href);
            console.log('Posição:', whatsappLink.getBoundingClientRect());
            console.log('Z-index:', window.getComputedStyle(whatsappLink).zIndex);
            
            // Adiciona apenas um evento de log para debug
            whatsappLink.addEventListener('click', function(e) {
                console.log('🔗 WhatsApp clicado via JavaScript!');
                console.log('Link:', this.href);
                e.preventDefault(); // Previne o comportamento padrão temporariamente
                
                // Abre o WhatsApp manualmente
                window.open(this.href, '_blank');
            });
            
        } else {
            console.error('❌ Botão WhatsApp não encontrado!');
        }
    }
    
    // Configura o link do WhatsApp
    setupWhatsAppLink();
    
    // Reconfigura o link do WhatsApp quando a janela é redimensionada
    // (útil para quando o usuário muda a orientação do dispositivo)
    window.addEventListener('resize', function() {
        // Pequeno delay para garantir que a detecção seja precisa
        setTimeout(setupWhatsAppLink, 100);
    });
    
    // Interactive Dragon Animation
    initDragonAnimation();
});

// === Dragão Interativo (SVG puro) ===
function initDragonAnimation() {
  "use strict";

  const screen = document.getElementById("screen");
  const xmlns = "http://www.w3.org/2000/svg";
  const xlinkns = "http://www.w3.org/1999/xlink";

  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      rad = 0;
    },
    false
  );

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
  };

  let width, height;
  window.addEventListener("resize", () => resize(), false);
  resize();

  const prepend = (use, i) => {
    const elem = document.createElementNS(xmlns, "use");
    elems[i].use = elem;
    elem.setAttributeNS(xlinkns, "xlink:href", "#" + use);
    screen.prepend(elem);
  };

  const N = 40;

  const elems = [];
  for (let i = 0; i < N; i++) elems[i] = { use: null, x: width / 2, y: 0 };
  const pointer = { x: width / 2, y: height / 2 };
  const radm = Math.min(pointer.x, pointer.y) - 20;
  let frm = Math.random();
  let rad = 0;

  for (let i = 1; i < N; i++) {
    if (i === 1) prepend("Cabeza", i);
    else if (i === 8 || i === 14) prepend("Aletas", i);
    else prepend("Espina", i);
  }

  const run = () => {
    requestAnimationFrame(run);
    let e = elems[0];
    const ax = (Math.cos(3 * frm) * rad * width) / height;
    const ay = (Math.sin(4 * frm) * rad * height) / width;
    e.x += (ax + pointer.x - e.x) / 10;
    e.y += (ay + pointer.y - e.y) / 10;
    for (let i = 1; i < N; i++) {
      let e = elems[i];
      let ep = elems[i - 1];
      const a = Math.atan2(e.y - ep.y, e.x - ep.x);
      e.x += (ep.x - e.x + (Math.cos(a) * (100 - i)) / 5) / 4;
      e.y += (ep.y - e.y + (Math.sin(a) * (100 - i)) / 5) / 4;
      const s = (162 + 4 * (1 - i)) / 50;
      e.use.setAttributeNS(
        null,
        "transform",
        `translate(${(ep.x + e.x) / 2},${(ep.y + e.y) / 2}) rotate(${
          (180 / Math.PI) * a
        }) translate(${0},${0}) scale(${s},${s})`
      );
    }
    if (rad < radm) rad++;
    frm += 0.003;
    if (rad > 60) {
      pointer.x += (width / 2 - pointer.x) * 0.05;
      pointer.y += (height / 2 - pointer.y) * 0.05;
    }
  };

  run();
}

// Adiciona estilos CSS para o link ativo
const style = document.createElement('style');
style.textContent = `
    .nav-menu a.active {
        color: #2563eb !important;
        font-weight: 600;
    }
    
    .notification {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
`;
document.head.appendChild(style);
