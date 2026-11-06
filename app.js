// NutriSUS, protótipo front-end os dados são em memória.
const $ = s => document.querySelector(s);
const hoje = () => new Date().toLocaleDateString('pt-BR');
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200) }

// dados de teste
const contas = [
    { id: 'maria', nome: 'Maria Teste', email: 'paciente@teste.com', senha: '123456', role: 'paciente' },
    { id: 'nutri', nome: 'Dra. Ana Teste', email: 'nutri@teste.com', senha: '123456', role: 'nutricionista', crn: 'CRN-0000', valid: true, dataValid: '01/11/2026', tel: '(00) 00000-0000', esp: 'Nutrição clínica' }];
const novoPac = (nome) => ({ nome, meals: [], evol: [], exams: [], notifs: [{ t: 'Bem-vindo(a) ao NutriSUS!', d: hoje() }], msgs: [], plano: null, consultas: [] });
const dados = {
    maria: {
        nome: 'Maria Teste',
        meals: [{ n: 'Café da manhã', h: '07:30', desc: 'Pão integral, ovo e mamão', d: hoje() }],
        evol: [{ peso: 68.4, sint: 'Sem sintomas', d: '01/11/2026' }, { peso: 67.9, sint: 'Leve cansaço', d: '05/11/2026' }],
        exams: [{ arq: 'hemograma-teste.pdf', d: '03/11/2026' }],
        notifs: [{ t: 'Seu plano alimentar foi atualizado.', d: hoje() }, { t: 'Teleconsulta marcada para 10/11 às 09:00.', d: hoje() }],
        msgs: [{ de: 'nutri', txt: 'Oi, Maria! Como foi a semana?' }],
        plano: 'Café da manhã: pão integral, ovo, fruta.\nAlmoço: arroz, feijão, salada e proteína grelhada.\nLanche: iogurte natural com aveia.\nJantar: sopa de legumes.\nBeber 2 L de água por dia.',
        consultas: [{ d: '10/11/2026 09:00', tipo: 'Teleconsulta de retorno', obs: 'Agendada' }]
    },
    joao: { ...novoPac('João Teste'), evol: [{ peso: 82.0, sint: 'Sem sintomas', d: '02/11/2026' }], plano: 'Plano inicial em elaboração.' }
};
const unidades = [{ n: 'UBS Centro (fictícia)', e: 'Rua das Flores, 100', h: 'Seg–Sex, 7h–17h' }, { n: 'UBS Jardim Verde (fictícia)', e: 'Av. Brasil, 250', h: 'Seg–Sex, 8h–16h' }, { n: 'Policlínica Norte (fictícia)', e: 'Rua Central, 45', h: 'Seg–Sáb, 7h–19h' }];

let S = { role: 'paciente', cad: false, user: null, view: 'inicio', alvo: 'maria' };
const P = () => dados[S.user.id];            // dados do paciente logado
const A = () => dados[S.alvo];               // paciente selecionado pelo nutricionista

function atualizaLogin() {
    document.querySelectorAll('#roleTabs button').forEach(b => b.classList.toggle('on', b.dataset.r === S.role));
    $('#fNome').parentElement.hidden = !S.cad;
    $('#enviar').textContent = S.cad ? 'Cadastrar' : 'Entrar';
    $('#alterna').textContent = S.cad ? 'Já tenho conta. Entrar' : 'Não tem conta? Cadastre-se';
    $('#dica').textContent = (S.role === 'paciente' ? 'paciente@teste.com' : 'nutri@teste.com') + ' / 123456';
    $('#erro').textContent = '';
}
$('#roleTabs').onclick = e => { if (e.target.dataset.r) { S.role = e.target.dataset.r; atualizaLogin() } };
$('#alterna').onclick = () => { S.cad = !S.cad; atualizaLogin() };
$('#loginForm').onsubmit = e => {
    e.preventDefault(); const em = $('#fEmail').value.trim().toLowerCase(), se = $('#fSenha').value, nm = $('#fNome').value.trim();
    if (S.cad) {
        if (!nm || se.length < 4) return $('#erro').textContent = 'Preencha o nome e use uma senha com 4+ caracteres.';
        if (contas.some(c => c.email === em)) return $('#erro').textContent = 'Este e-mail já está cadastrado.';
        const c = { id: 'u' + Date.now(), nome: nm, email: em, senha: se, role: S.role }; contas.push(c);
        if (S.role === 'paciente') dados[c.id] = novoPac(nm);
        toast('Cadastro realizado!'); return entrar(c);
    }
    const c = contas.find(c => c.email === em && c.senha === se && c.role === S.role);   // autenticação simulada
    if (!c) return $('#erro').textContent = 'E-mail ou senha incorretos. Confira os dados.';
    entrar(c);
};
function entrar(c) {
    $('#gov').hidden = true; S.user = c; S.view = c.role === 'paciente' ? 'inicio' : 'pacientes'; $('#login').hidden = true; $('#app').hidden = false;
    $('#quem').textContent = c.nome + ' (' + c.role + ')'; montaMenu(); render()
}
// Login gov simulado 
$('#govBtn').onclick = () => { $('#gov').hidden = false; $('#govCpf').value = '' };
$('#govVolta').onclick = () => { $('#gov').hidden = true };
document.querySelectorAll('[data-gov]').forEach(b => b.onclick = () => { toast('Entrando com gov.br (simulado)'); entrar(contas.find(c => c.role === S.role)) });
$('#sair').onclick = () => { $('#app').hidden = true; $('#login').hidden = false; $('#loginForm').reset(); S.cad = false; atualizaLogin() };

// menu
const menus = {
    paciente: [['inicio', 'Início'], ['refeicoes', 'Registrar refeições'], ['evolucao', 'Evolução física'], ['plano', 'Plano alimentar'], ['exames', 'Enviar exames'], ['mensagens', 'Mensagens'], ['tele', 'Teleconsulta'], ['unidades', 'Unidades de saúde'], ['notif', 'Notificações'], ['perfil', 'Perfil'], ['req', 'Requisitos']],
    nutricionista: [['pacientes', 'Pacientes'], ['historico', 'Histórico'], ['consulta', 'Registrar consulta'], ['planoN', 'Gerenciar plano'], ['mensagensN', 'Responder mensagens'], ['relat', 'Relatórios'], ['perfil', 'Perfil'], ['req', 'Requisitos']]
};
function montaMenu() { $('#menu').innerHTML = menus[S.user.role].map(([k, n]) => `<button data-v="${k}">${n}</button>`).join('') }
$('#menu').onclick = e => { if (e.target.dataset.v) { S.view = e.target.dataset.v; render() } };

// telas
const lista = (arr, f) => arr.length ? arr.map(f).join('') : '<p class="vazio">Nada registrado ainda.</p>';
const seletor = () => `<label>Paciente <select id="selP">${Object.keys(dados).map(k => `<option value="${k}" ${k === S.alvo ? 'selected' : ''}>${esc(dados[k].nome)}</option>`).join('')}</select></label>`;
const V = {
    inicio: () => {
        const p = P(); return `<div class="grid">
  <div class="card g"><h2>Próxima consulta</h2><div class="big">${p.consultas[0] ? esc(p.consultas[0].d) : '—'}</div><small>${p.consultas[0] ? esc(p.consultas[0].tipo) : 'Nenhuma agendada'}</small></div>
  <div class="card g"><h2>Refeições registradas</h2><div class="big">${p.meals.length}</div></div>
  <div class="card g"><h2>Notificações</h2><div class="big">${p.notifs.length}</div></div></div>
  <div class="card"><h2>Último peso</h2><p>${p.evol.length ? p.evol.at(-1).peso + ' kg em ' + p.evol.at(-1).d : '<span class="vazio">Sem registros.</span>'}</p></div>`
    },
    refeicoes: () => `<div class="card"><h2>Nova refeição</h2><form data-f="meal"><label>Refeição <input name="n" required placeholder="Ex.: Almoço"></label><label>Horário <input name="h" type="time" required></label><label>O que você comeu <textarea name="desc" required></textarea></label><button class="btn">Salvar refeição</button></form></div>
  <div class="card"><h2>Histórico</h2>${lista(P().meals, m => `<div class="item"><b>${esc(m.n)}</b> às ${m.h}<small>${esc(m.desc)} · ${m.d}</small></div>`)}</div>`,
    evolucao: () => `<div class="card"><h2>Nova medição</h2><form data-f="evol"><label>Peso (kg) <input name="peso" type="number" step="0.1" min="1" required></label><label>Sintomas <input name="sint" placeholder="Opcional"></label><button class="btn">Salvar evolução</button></form></div>
  <div class="card"><h2>Evolução</h2>${lista(P().evol, e => `<div class="item"><b>${e.peso} kg</b> · ${e.d}<small>${esc(e.sint || 'Sem sintomas')}</small></div>`)}</div>`,
    plano: () => `<div class="card g"><h2>Meu plano alimentar</h2>${P().plano ? `<p style="white-space:pre-line">${esc(P().plano)}</p>` : '<p class="vazio">Não há plano disponível ainda.</p>'}</div>`,
    exames: () => `<div class="card"><h2>Enviar exame</h2><form data-f="exam"><label>Arquivo (PDF ou imagem) <input name="arq" type="file" accept=".pdf,image/*" required></label><button class="btn">Enviar</button></form><small>Simulado: só o nome do arquivo é guardado.</small></div>
  <div class="card"><h2>Exames enviados</h2>${lista(P().exams, x => `<div class="item">${esc(x.arq)}<small>${x.d}</small></div>`)}</div>`,
    mensagens: () => chat(P(), 'paciente'),
    tele: () => { const c = P().consultas[0]; return `<div class="card"><h2>Teleconsulta</h2>${c ? `<p>${esc(c.tipo)} em <b>${esc(c.d)}</b></p><button class="btn" id="entrar">Entrar na sala</button>` : '<p class="vazio">Nenhuma consulta combinada.</p>'}</div><div id="sala"></div>` },
    unidades: () => `<div class="card"><label>Buscar unidade <input id="busca" placeholder="Nome ou rua"></label><div id="ul">${ulist('')}</div></div>`,
    notif: () => `<div class="card"><h2>Avisos</h2>${P().notifs.length ? lista(P().notifs, n => `<div class="item">${esc(n.t)}<small>${n.d}</small></div>`) : '<p class="vazio">Não há avisos novos.</p>'}</div>`,
    // nutricionista
    pacientes: () => `<div class="card"><h2>Pacientes vinculados</h2><table><tr><th>Nome</th><th>Peso atual</th><th></th></tr>${Object.keys(dados).map(k => `<tr><td>${esc(dados[k].nome)}</td><td>${dados[k].evol.length ? dados[k].evol.at(-1).peso + ' kg' : '—'}</td><td><button class="btn" data-sel="${k}">Abrir histórico</button></td></tr>`).join('')}</table></div>`,
    historico: () => {
        const a = A(); return seletor() + `<div class="grid"><div class="card"><h2>Refeições</h2>${lista(a.meals, m => `<div class="item"><b>${esc(m.n)}</b> ${m.h}<small>${esc(m.desc)}</small></div>`)}</div>
  <div class="card"><h2>Evolução</h2>${lista(a.evol, e => `<div class="item"><b>${e.peso} kg</b> · ${e.d}<small>${esc(e.sint)}</small></div>`)}</div>
  <div class="card"><h2>Exames</h2>${lista(a.exams, x => `<div class="item">${esc(x.arq)}<small>${x.d}</small></div>`)}</div>
  <div class="card"><h2>Consultas</h2>${lista(a.consultas, c => `<div class="item">${esc(c.d)} – ${esc(c.tipo)}<small>${esc(c.obs)}</small></div>`)}</div></div>`
    },
    consulta: () => seletor() + `<div class="card"><h2>Registrar consulta</h2><form data-f="cons"><label>Data e hora <input name="d" type="datetime-local" required></label><label>Tipo <select name="tipo"><option>Teleconsulta</option><option>Retorno</option></select></label><label>Observações <textarea name="obs" required></textarea></label><button class="btn">Salvar consulta</button></form></div>`,
    planoN: () => seletor() + `<div class="card"><h2>Plano alimentar de ${esc(A().nome)}</h2><form data-f="plano"><label>Plano <textarea name="plano" rows="8" required>${esc(A().plano || '')}</textarea></label><button class="btn">Salvar plano</button></form></div>`,
    mensagensN: () => seletor() + chat(A(), 'nutricionista'),
    relat: () => seletor() + `<div class="card"><button class="btn" id="gerar">Gerar relatório</button><div id="rel"></div></div>`,
    perfil: () => S.user.role === 'paciente' ? perfilP() : perfilN(),
    req
};
const campo = (l, n, v = '', x = '') => `<label>${l} <input name="${n}" value="${esc(v)}" ${x}></label>`;
function perfilP() {
    const u = S.user, p = P(), f = p.perfil = p.perfil || {};
    return `<div class="card"><h2>Meu perfil</h2><form data-f="perfilP">${campo('Nome', 'nome', u.nome, 'required')}${campo('E-mail', 'email', u.email, 'readonly')}${campo('Data de nascimento', 'nasc', f.nasc || '', 'type="date"')}${campo('Altura (m)', 'alt', f.alt || '', 'type="number" step="0.01"')}${campo('Alergias', 'alerg', f.alerg || '')}${campo('Restrições alimentares', 'restr', f.restr || '')}${campo('Objetivos', 'obj', f.obj || '')}<button class="btn">Salvar perfil</button></form></div>`
}
function perfilN() {
    const u = S.user;
    return `<div class="card ${u.valid ? 'g' : ''}"><h2>Validação profissional</h2>${u.valid ? `<p><span class="tag ok">Validado</span> <b>${esc(u.crn)}</b> validado na última data <b>${u.dataValid}</b></p>` : `<p><span class="tag nao">Não validado</span> ${esc(u.crn || 'CRN não informado')}</p>`}
 <form data-f="crn" class="row">${campo('', 'crn', u.crn || '', 'placeholder="CRN-1234" required')}<button class="btn">Validar CRN</button></form><small>Demonstração: só confere o formato CRN-1234. Não consulta o conselho de verdade.</small></div>
 <div class="card"><h2>Meu perfil</h2><form data-f="perfilN">${campo('Nome', 'nome', u.nome, 'required')}${campo('E-mail', 'email', u.email, 'readonly')}${campo('Telefone profissional', 'tel', u.tel || '')}${campo('Especialidade', 'esp', u.esp || '')}<button class="btn">Salvar perfil</button></form></div>`
}
function chat(p, eu) { return `<div class="card"><h2>Conversa com ${eu === 'paciente' ? 'a nutricionista' : esc(p.nome)}</h2><div class="chat">${lista(p.msgs, m => `<div class="msg ${m.de === eu ? 'eu' : ''}">${esc(m.txt)}</div>`)}</div><form data-f="msg" class="row"><input name="txt" required placeholder="Escreva a mensagem"><button class="btn">Enviar</button></form></div>` }
function ulist(q) { const r = unidades.filter(u => (u.n + u.e).toLowerCase().includes(q.toLowerCase())); return r.length ? r.map(u => `<div class="item"><b>${u.n}</b><small>${u.e} · ${u.h}</small></div>`).join('') : '<p class="vazio">Nenhum resultado encontrado.</p>' }
function req() {
    const R = [['RF01', 'Cadastrar-se e fazer login / autenticar usuário', 'sim', 'Simulado: contas em memória, sem banco'], ['RF02', 'Enviar exames', 'sim', 'Simulado: só guarda o nome do arquivo'], ['RF03', 'Registrar refeições', 'ok', 'Implementado no front-end'], ['RF04', 'Registrar evolução física', 'ok', 'Implementado no front-end'], ['RF05', 'Visualizar plano alimentar', 'ok', 'Implementado'], ['RF06', 'Receber notificações', 'sim', 'Simulado: avisos pré-definidos'], ['RF07', 'Enviar mensagens / responder mensagens', 'sim', 'Simulado: troca local entre as telas, sem servidor'], ['RF08', 'Realizar teleconsulta', 'sim', 'Simulado: sala fictícia, sem vídeo'], ['RF09', 'Consultar unidade de saúde', 'sim', 'Simulado: unidades fictícias'], ['RF10', 'Consultar pacientes e visualizar histórico', 'ok', 'Implementado'], ['RF11', 'Registrar consulta', 'ok', 'Implementado'], ['RF12', 'Gerenciar plano alimentar', 'ok', 'Implementado'], ['RF13', 'Gerar relatórios', 'sim', 'Simulado: resumo na tela, sem PDF'], ['RF16', 'Entrar com a conta gov.br', 'sim', 'Simulado: tela fictícia, entra com conta de teste sem validar CPF'], ['RF14', 'Perfil do paciente e do nutricionista', 'ok', 'Implementado (dados em memória)'], ['RF15', 'Validação do CRN do nutricionista', 'sim', 'Simulado: confere só o formato'], ['—', 'Banco de dados / persistência', 'nao', 'Não implementado: dados somem ao recarregar']];
    const tag = { ok: ['ok', 'Implementado'], sim: ['sim', 'Simulado'], nao: ['nao', 'Não concluído'] };
    return `<div class="card"><table><tr><th>ID</th><th>Requisito (casos de uso)</th><th>Status</th><th>Observação</th></tr>${R.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td><span class="tag ${tag[r[2]][0]}">${tag[r[2]][1]}</span></td><td>${r[3]}</td></tr>`).join('')}</table></div>
 <div class="card g"><h2>Cenário de demonstração</h2><p>1) Entre como paciente (paciente@teste.com / 123456), registre uma refeição, uma medição e um exame, e envie uma mensagem.<br>2) Saia e entre como nutricionista (nutri@teste.com / 123456), abra o histórico da Maria, atualize o plano e responda a mensagem.<br>3) Volte como paciente e veja o plano e a resposta.</p></div>`}

// render e eventos 
function render() {
    const nome = [...menus[S.user.role]].find(m => m[0] === S.view)[1];
    $('#titulo').textContent = nome; $('#tela').innerHTML = V[S.view]();
    document.querySelectorAll('#menu button').forEach(b => b.classList.toggle('on', b.dataset.v === S.view));
}
$('#tela').onchange = e => { if (e.target.id === 'selP') { S.alvo = e.target.value; render() } };
$('#tela').oninput = e => { if (e.target.id === 'busca') $('#ul').innerHTML = ulist(e.target.value) };
$('#tela').onclick = e => {
    const t = e.target;
    if (t.dataset.sel) { S.alvo = t.dataset.sel; S.view = 'historico'; render() }
    if (t.id === 'entrar') $('#sala').innerHTML = '<div class="sala"><h2 style="color:#fff">Sala de teleconsulta (simulada)</h2><p>Conectado com a nutricionista. Vídeo não implementado neste protótipo.</p><button class="btn" id="fim">Encerrar</button></div>';
    if (t.id === 'fim') { $('#sala').innerHTML = ''; toast('Teleconsulta encerrada') }
    if (t.id === 'gerar') { const a = A(), pe = a.evol.map(x => x.peso); $('#rel').innerHTML = `<div class="item"><b>${esc(a.nome)}</b><small>Refeições: ${a.meals.length} · Exames: ${a.exams.length} · Consultas: ${a.consultas.length}</small>${pe.length ? `<small>Peso: ${pe[0]} kg → ${pe.at(-1)} kg (${(pe.at(-1) - pe[0]).toFixed(1)} kg)</small>` : '<small>Sem dados de peso para o relatório.</small>'}</div>` }
};
document.addEventListener('submit', e => {
    const f = e.target.dataset.f; if (!f) return; e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target)); const nut = S.user.role === 'nutricionista';
    if (f === 'crn') {
        const c = d.crn.trim().toUpperCase(); if (!/^CRN-\d{4,6}$/.test(c)) return toast('CRN inválido. Use o formato CRN-1234.');
        toast('Consultando conselho (simulado)...'); setTimeout(() => { Object.assign(S.user, { crn: c, valid: true, dataValid: hoje() }); render(); toast('CRN validado (demonstração)') }, 1000); return
    }
    if (f === 'perfilP') { P().perfil = { ...P().perfil, ...d }; S.user.nome = P().nome = d.nome; $('#quem').textContent = d.nome + ' (paciente)' }
    if (f === 'perfilN') { Object.assign(S.user, { nome: d.nome, tel: d.tel, esp: d.esp }); $('#quem').textContent = d.nome + ' (nutricionista)' }
    if (f === 'meal') P().meals.unshift({ ...d, d: hoje() });
    if (f === 'evol') P().evol.push({ peso: +d.peso, sint: d.sint, d: hoje() });
    if (f === 'exam') P().exams.unshift({ arq: d.arq.name, d: hoje() });
    if (f === 'msg') { const p = nut ? A() : P(); p.msgs.push({ de: nut ? 'nutricionista' : 'paciente', txt: d.txt }); p.notifs.unshift({ t: nut ? 'Nova mensagem da nutricionista.' : 'Nova mensagem do paciente.', d: hoje() }) }
    if (f === 'cons') { const dt = new Date(d.d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }); A().consultas.unshift({ d: dt, tipo: d.tipo, obs: d.obs }); A().notifs.unshift({ t: 'Consulta registrada para ' + dt + '.', d: hoje() }) }
    if (f === 'plano') { A().plano = d.plano; A().notifs.unshift({ t: 'Seu plano alimentar foi atualizado.', d: hoje() }) }
    toast('Salvo com sucesso!'); render();
});
atualizaLogin();
