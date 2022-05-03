OrcamentosView.prototype = new View();
OrcamentosView.prototype.constructor = OrcamentosView;

function OrcamentosView(scope, container, section) {
	this.scope = scope;
	this.section = section;
	this.children = [];
	this.container = container;
	this.$.container = $(this.container);
	this.json = OrcamentosView.json;

	this.init();
}
OrcamentosView.prototype.initActions = function () {
	var self = this;

	const parsePreco = (str) =>
		parseFloat(str.replace(".", "").replace(",", ".").replace("€", "").trim());
	const parseNum = (str) =>
		parseFloat(str.replace(".", "").replace(",", ".").trim());
	const trimArray = (arr) => {
		let startTrim = 0;
		let endTrim = arr.length;

		for (let i = 0; i < arr.length; i++) {
			if (arr[i]) break;
			startTrim = i + 1;
		}

		for (let i = endTrim - 1; i > 0; i--) {
			if (arr[i]) break;
			endTrim = i;
		}

		return arr.slice(startTrim, endTrim);
	};
	const parseData = (rawData) => {
		const data = rawData.split("\n").map((l) => {
			const line = l.trim();
			if (line.length === 0) return null;

			const lineData = line.split("\t");

			if (lineData.length < 2) return null;
			if (lineData.length < 11) {
				return {
					descricao: lineData[1].trim(),
				};
			}
			try {
				return {
					referencia: lineData[0].trim(),
					descricao: lineData[1].trim(),
					unidade: lineData[2].trim(),
					quantidade: parseNum(lineData[3].trim()),
					comprimento: parseNum(lineData[4].trim()),
					largura: parseNum(lineData[5].trim()),
					altura: parseNum(lineData[6].trim()),
					peso: parseNum(lineData[7].trim()),
					quantidade_t: parseNum(lineData[8].trim()),
					preco_u: parsePreco(lineData[9]),
					preco: parsePreco(lineData[10]),
				};
			} catch (e) {
				console.log(e);
				return null;
			}
		});

		const trimmedData = trimArray(data);
		return trimmedData;
	};
	const makeDataPreview = (data) => {
		if (data.length === 0) {
			return "";
		}

		let html = `
			<table class="table">
				${data
					.map((line) => {
						return `
							<tr>
								<td>${line?.referencia ?? ""}</td>
								<td>${line?.descricao ?? ""}</td>
								<td>${line?.unidade ?? ""}</td>
								<td>${line?.quantidade ?? ""}</td>
								<td>${line?.comprimento ?? ""}</td>
								<td>${line?.largura ?? ""}</td>
								<td>${line?.altura ?? ""}</td>
								<td>${line?.peso ?? ""}</td>
								<td>${line?.quantidade_t ?? ""}</td>
								<td>${line?.preco_u ?? ""}</td>
								<td>${line?.preco ?? ""}</td>
							</tr>`;
					})
					.join("")}
			</table>
		`;
		return html;
	};

	this.Actions = {
		header: {},
		form: {
			ArtigosRowCallback: function () {
				console.log("string");
			},
			ImportModal: function (btn, form) {
				var html = $(`
					<div>
						<div data-component="ImportExcelForm" class="component" >
						</div>
						<div style="padding: 20px">
							<h4>Pre-visualização de dados:</h4>
							<div class="table-container"></div>
						</div>
					</div>
				`);

				var modalFormJson = window.Instances.ImportExcelForm.opts;
				var modalForm = new window.Templates.form(
					form,
					html.find(".component"),
					modalFormJson,
					{}
				);
				form.children.push(modalForm);
				const tableDiv = html.find(".table-container");

				console.log(
					modalForm,
					modalForm.children,
					modalFormJson,
					modalForm._("_TextArea")
				);

				let excelData = null;
				var modal = Tools.Modals.customMulti({
					title: "Importar dados Excel",
					cancel: "Cancelar",
					ok: "Adicionar",
					preventClose: false,
					size: "xl",
					html: html,
					onShown: function () {
						console.log(
							modalForm,
							modalForm.children,
							modalFormJson,
							modalForm._("_TextArea")
						);

						textArea = modalForm._("_TextArea")[0];
						textArea.onChange((cmp, val) => {
							excelData = parseData(val);
							const html = makeDataPreview(excelData);
							tableDiv.html(html);
						});
					},
				}).then((btn) => {
					if (btn === "ok" && excelData && excelData.length > 0) {
						var editGrid = form.children.find((x) => x.json.id === "linhas");
						var fields = editGrid.fields;
						var fieldTypes = editGrid.fieldTypes;
						var data = editGrid.original ? editGrid.original.data : [];

						var original = {
							data,
							fields,
							fieldTypes,
						};

						excelData.forEach((l) => {
							var rowData = {
								Armazém: "1",
								Referência: l?.referencia ?? "",
								Designação: l?.descricao ?? "",
								Quantidade: l?.quantidade ?? "",
								Comprimento: l?.comprimento ?? "",
								Largura: l?.largura ?? "",
								Altura: l?.altura ?? "",
								"Preço Unit.": l?.preco_u ?? "",
								"Peso Unit.": l?.peso ?? "",
							};

							original.data.push(rowData);

							var $row = $(editGrid.makeRow(fields, rowData)).addClass("new");
							editGrid.$.tbody.append($row);
						});

						editGrid.original = original;
					}
				});
				// modal with textarea
				// tabela preview / error
			},
			AbrirModalEstados: function (textAction) {
				const form = textAction._("^form")[0];
				var html = $(`
					<div>
						<div data-component="OrcamentoEstadosWidget" class="component" >
						</div>
					</div>
				`);

				var modalGridJson = window.Instances.OrcamentoEstadosWidget.opts;
				var modalGrid = new window.Templates.widgets.HTMLContainer(
					form,
					html.find(".component"),
					modalGridJson,
					{}
				);
				form.children.push(modalGrid);

				var modal = Tools.Modals.customMulti({
					title: "Estado do orçamento",
					cancel: "Fechar",
					preventClose: false,
					html: html,
				});
			},
			AbrirModalPesquisaArtigo: function (btn, form) {
				var html = $(`
					<div>
						<div data-component="PesquisaArtigosGrid" class="component" >
						</div>
					</div>
				`);

				var modalGridJson = window.Instances.PesquisaArtigosGrid.opts;
				var modalGrid = new window.Templates.grid(
					form,
					html.find(".component"),
					modalGridJson,
					{}
				);
				form.children.push(modalGrid);

				var modal = Tools.Modals.customMulti({
					title: "Pesquisa Artigos",
					cancel: "Cancelar",
					ok: "Adicionar",
					preventClose: false,
					size: "xl",
					html: html,
					onShown: function () {
						modalGrid.refresh();
					},
				});

				modal
					.then(function (pressedButton) {
						const selected = modalGrid.getSelected();
						if (pressedButton === "ok" && selected.length > 0) {
							var editGrid = form.children.find((x) => x.json.id === "linhas");
							var fields = editGrid.fields;
							var fieldTypes = editGrid.fieldTypes;
							var data = editGrid.original ? editGrid.original.data : [];

							var original = {
								data,
								fields,
								fieldTypes,
							};

							selected.list.forEach((item, index) => {
								var rowData = {
									Armazém: item.CODIGO_ARM,
									Referência: item.REFERENCIA,
									Designação: item.DESIGNACAO1,
									Cod_Familia: item.COD_FAMILIA,
									Família: item.FAMILIA,
									Quantidade: 1,
									Comprimento: item.COMPRIMENTO,
									Largura: item.LARGURA,
									Altura: item.ALTURA,
									"Preço Unit.": item.PRECO1,
									"Peso Unit.": item.PESO_BRUTO,
								};

								original.data.push(rowData);

								var $row = $(editGrid.makeRow(fields, rowData)).addClass("new");
								editGrid.$.tbody.append($row);
							});

							editGrid.original = original;
						}
						//TODO
						form.children.pop();
					})
					.catch(function () {
						modal.unlockButtons();
						//TODO
						form.children.pop();
					});
			},
			ChangedOportunidade: function (selectedValue, form, event, select) {
				if (!selectedValue) return;

				var id = select.getObject().COD_CLIENTE.trim();
				var clienteSelect = form.children.find(
					(x) => x.json.id === "cod_cliente"
				);
				clienteSelect.set(id, true);
			},
			ChangedCliente: function (selectedValue, form, event, select) {
				if (!selectedValue) return;

				var poca_conta = select.getObject().POCA_CONTA;
				var poca_enti = select.getObject().POCA_ENTI;

				var enti_ncont = select.getObject().ENTI_NCONT;
				var enti_tel1 = select.getObject().ENTI_TEL1;
				var enti_telm1 = select.getObject().ENTI_TELM1;
				var enti_mail = select.getObject().ENTI_MAIL;

				var poca_conta_in = form.children.find(
					(x) => x.json.id === "poca_conta"
				); //form._("_poca_conta")[0].set();
				var poca_enti_in = form.children.find((x) => x.json.id === "poca_enti");

				var enti_ncont_in = form.children.find(
					(x) => x.json.id === "enti_ncont"
				);
				var enti_tel1_in = form.children.find((x) => x.json.id === "enti_tel1");
				var enti_telm1_in = form.children.find(
					(x) => x.json.id === "enti_telm1"
				);
				var enti_mail_in = form.children.find((x) => x.json.id === "enti_mail");

				poca_conta_in.set(poca_conta, true);
				poca_enti_in.set(poca_enti, true);

				enti_ncont_in.set(enti_ncont, true);
				enti_tel1_in.set(enti_tel1, true);
				enti_telm1_in.set(enti_telm1, true);
				enti_mail_in.set(enti_mail, true);
			},
		},
	};
};

OrcamentosView.json = window.Views.OrcamentosView.view;
window.Views.OrcamentosView = OrcamentosView;
