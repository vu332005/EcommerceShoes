import { Request, Response } from "express";
import * as adminOrderService from "../services/adminOrderService";
import { catchAsync } from "../utils/catchAsync";

export const getOrders = catchAsync(async (req: Request, res: Response) => {
  const params = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    status: req.query.status as string,
    keyword: req.query.keyword as string,
  };

  const result = await adminOrderService.getAllOrders(params);
  res.status(200).json({ status: "success", data: result });
});

export const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body; // { status: "shipping" }
  
  const result = await adminOrderService.updateOrderStatus(id, status);
  res.status(200).json({ status: "success", message: "Cập nhật trạng thái thành công", data: result });
});

export const getDetail = catchAsync(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = await adminOrderService.getOrderDetail(id);
    res.status(200).json({ status: "success", data });
});