from fpdf import FPDF
from datetime import datetime
import io

class SolarReportGenerator(FPDF):
    def header(self):
        # Logo placeholder (can be added later)
        self.set_font('helvetica', 'B', 15)
        self.set_text_color(245, 158, 11) # Solar Orange
        self.cell(0, 10, 'SolarVista Optimization Report', border=0, ln=1, align='C')
        self.set_font('helvetica', 'I', 10)
        self.set_text_color(100)
        self.cell(0, 10, f'Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', border=0, ln=1, align='C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(128)
        self.cell(0, 10, f'Page {self.page_no()} | Solar Energy Generation Forecasting & Optimization Platform', 0, 0, 'C')

    def chapter_title(self, title):
        self.set_font('helvetica', 'B', 12)
        self.set_fill_color(30, 41, 59) # Dark Surface
        self.set_text_color(255, 255, 255)
        self.cell(0, 10, f'  {title}', ln=1, fill=True)
        self.ln(4)

    def chapter_body(self, body):
        self.set_font('helvetica', '', 10)
        self.set_text_color(50)
        self.multi_cell(0, 6, body)
        self.ln()

    def add_metric_table(self, metrics):
        self.set_font('helvetica', 'B', 10)
        self.set_fill_color(240, 240, 240)
        self.cell(95, 10, 'Metric', border=1, fill=True)
        self.cell(95, 10, 'Value', border=1, fill=True)
        self.ln()
        
        self.set_font('helvetica', '', 10)
        for label, value in metrics.items():
            self.cell(95, 10, label, border=1)
            self.cell(95, 10, str(value), border=1)
            self.ln()
        self.ln(5)

def generate_pdf_report(forecast_data, report_json):
    """
    Generates a PDF report from forecast data and agent analysis.
    Returns: Bytes of the generated PDF.
    """
    pdf = SolarReportGenerator()
    pdf.add_page()

    # 1. Forecast Summary
    pdf.chapter_title('1. Forecast Summary')
    metrics = {
        "Average Predicted Power": f"{forecast_data.get('average_power', 0):.2f} kW",
        "Total Daily Estimated Output": f"{forecast_data.get('daily_output', 0):.2f} kWh",
        "Peak Power Hour": f"{forecast_data.get('peak_hour', 'N/A')}",
        "Estimated Savings (Today)": f"INR {forecast_data.get('daily_savings', 0):.2f}"
    }
    pdf.add_metric_table(metrics)
    pdf.chapter_body(report_json.get('summary', 'No summary available.'))

    # 2. Risk Assessment
    pdf.chapter_title('2. Risk Assessment & Variability')
    pdf.chapter_body(report_json.get('risk_assessment', 'No risk assessment provided.'))

    # 3. Action Plan & Recommendations
    pdf.chapter_title('3. Grid Optimization & Action Plan')
    pdf.chapter_body(report_json.get('action_plan', 'No specific action plan provided.'))

    # Output as bytes
    pdf_bytes = pdf.output(dest='S')
    return pdf_bytes
