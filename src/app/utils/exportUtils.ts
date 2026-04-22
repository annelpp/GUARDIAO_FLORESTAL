import { jsPDF } from 'jspdf'; // 👈 Correção Crítica 1: Importação nomeada para evitar crash no Vite
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Tree, Alert } from '../data/mockData';

// 1. GERADOR DE CSV (Dados Brutos)
export const exportToCSV = (trees: Tree[], filename: string = 'dados_brutos_arvores.csv') => {
  if (!trees || !trees.length) return;

  const headers = Object.keys(trees[0]).join(',');
  const rows = trees.map(tree => {
    return Object.values(tree).map(value => {
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(',');
  });

  const csvContent = `${headers}\n${rows.join('\n')}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 2. GERADOR DO RELATÓRIO COMPLETO (PDF COM GRÁFICOS)
export const generateFullPDFReport = async (trees: Tree[], alerts: Alert[], chartsElementId?: string) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const dataAtual = new Date().toLocaleDateString('pt-BR');

  // Cabeçalho
  doc.setFontSize(20);
  doc.setTextColor(22, 163, 74);
  doc.text('Guardião Florestal - Relatório Completo', 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em: ${dataAtual}`, 14, 30);

  let currentY = 40;

  // --- CAPTURANDO OS GRÁFICOS (BLINDADO CONTRA ERROS) ---
  if (chartsElementId) {
    const chartsEl = document.getElementById(chartsElementId);
    if (chartsEl) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('1. Visão Geral e Gráficos (Dashboard)', 14, currentY);
      currentY += 8;

      try {
        // 👈 Correção Crítica 2: Reduzimos o scale e ativamos useCORS para estabilidade
        const canvas = await html2canvas(chartsEl, {
          scale: 1.5, 
          useCORS: true,
          backgroundColor: '#f9fafb'
        });

        const imgData = canvas.toDataURL('image/png');

        const pdfWidth = doc.internal.pageSize.getWidth() - 28; 
        const imgProps = doc.getImageProperties(imgData);
        let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        const maxPageHeight = 297 - currentY - 20; 
        let finalWidth = pdfWidth;
        
        if (pdfHeight > maxPageHeight) {
          pdfHeight = maxPageHeight;
          finalWidth = (imgProps.width * pdfHeight) / imgProps.height;
        }

        const xOffset = 14 + (pdfWidth - finalWidth) / 2;
        doc.addImage(imgData, 'PNG', xOffset, currentY, finalWidth, pdfHeight);

        doc.addPage();
        currentY = 20;
      } catch (error) {
        console.error("Erro silencioso ao capturar gráficos:", error);
        // Se a foto falhar, avisa no PDF mas CONTINUA gerando o documento!
        doc.setFontSize(10);
        doc.setTextColor(220, 38, 38);
        doc.text('(Não foi possível processar a imagem dos gráficos nesta sessão)', 14, currentY + 5);
        currentY += 15;
      }
    }
  }

  // --- SEÇÃO DE TABELAS ---
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(chartsElementId ? '2. Histórico de Alertas Recentes' : '1. Histórico de Alertas Recentes', 14, currentY);

  const alertsData = alerts.map(alert => [
    new Date(alert.timestamp).toLocaleDateString('pt-BR'),
    alert.type.toUpperCase(),
    alert.severity.toUpperCase(),
    alert.message
  ]);

  autoTable(doc, {
    startY: currentY + 5,
    head: [['Data', 'Tipo', 'Severidade', 'Mensagem']],
    body: alertsData,
    theme: 'striped',
    headStyles: { fillColor: [220, 38, 38] },
  });

  // 👈 Correção Crítica 3: Prevenção contra undefined no lastAutoTable
  const finalY = (doc as any).lastAutoTable?.finalY || (currentY + 40);
  
  doc.text(chartsElementId ? '3. Inventário de Árvores Monitoradas' : '2. Inventário de Árvores Monitoradas', 14, finalY + 15);

  const treesData = trees.map(tree => [
    tree.nfcId,
    tree.species,
    `${tree.temperature}°C`,
    tree.health.toUpperCase(),
    tree.status.toUpperCase()
  ]);

  autoTable(doc, {
    startY: finalY + 20,
    head: [['ID NFC', 'Espécie', 'Temp.', 'Saúde', 'Status']],
    body: treesData,
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74] },
  });

  // Força o download do PDF
  doc.save('Relatorio_Completo_Guardiao.pdf');
};

// 3. GERADOR DE RESUMO EXECUTIVO (PDF Simples)
export const generateExecutiveSummary = (trees: Tree[], alerts: Alert[]) => {
  const doc = new jsPDF(); // 👈 Usando a mesma importação corrigida
  
  doc.setFontSize(22);
  doc.setTextColor(30, 64, 175);
  doc.text('Resumo Executivo - Monitoramento', 14, 25);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  const activeAlerts = alerts.filter(a => !a.resolved).length;
  const criticalTrees = trees.filter(t => t.status === 'critical').length;
  
  doc.text(`Data da extração: ${new Date().toLocaleString('pt-BR')}`, 14, 35);
  doc.text('Este documento apresenta a síntese executiva da área monitorada.', 14, 45);
  
  doc.setFontSize(14);
  doc.text(`• Total de Árvores Monitoradas: ${trees.length}`, 14, 65);
  doc.text(`• Árvores em Estado Crítico: ${criticalTrees}`, 14, 75);
  doc.text(`• Alertas Ativos/Não Resolvidos: ${activeAlerts}`, 14, 85);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  let conclusao = "O sistema encontra-se dentro dos parâmetros normais de operação.";
  if (criticalTrees > 0 || activeAlerts > 0) {
    conclusao = "Atenção: Ações corretivas imediatas são recomendadas devido aos alertas ativos.";
    doc.setTextColor(220, 38, 38);
  }
  
  doc.text("Parecer do Sistema:", 14, 105);
  doc.text(conclusao, 14, 115);

  doc.save('Resumo_Executivo_Guardiao.pdf');
};