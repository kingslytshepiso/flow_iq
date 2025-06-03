import { InventoryService } from "@/lib/services/inventory.service";
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
      case "addInventoryItem":
        result = await InventoryService.addItem(data);
        break;
      case "updateStockLevel":
        result = await InventoryService.updateStockLevel(
          data.itemId,
          data.newLevel
        );
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Create response with data
    const response = NextResponse.json({
      success: true,
      data: result,
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
    console.error("Inventory API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
