import { CashFlowService } from "@/lib/services/cashflow.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "addSale":
        result = await CashFlowService.addSale(data);
        break;
      case "addExpense":
        result = await CashFlowService.addExpense(data);
        break;
      case "getSalesByDateRange":
        result = await CashFlowService.getSalesByDateRange(
          data.startDate,
          data.endDate
        );
        break;
      case "getExpensesByDateRange":
        result = await CashFlowService.getExpensesByDateRange(
          data.startDate,
          data.endDate
        );
        break;
      case "getTotalSales":
        result = await CashFlowService.getTotalSales(
          data.startDate,
          data.endDate
        );
        break;
      case "getTotalExpenses":
        result = await CashFlowService.getTotalExpenses(
          data.startDate,
          data.endDate
        );
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Create response with data
    const response = NextResponse.json({
      success: true,
      ...(typeof result === "number" ? { total: result } : { data: result }),
    });

    // Set cache control headers
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("CashFlow API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
