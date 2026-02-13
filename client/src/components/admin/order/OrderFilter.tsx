"use client";

import React from "react";
import { Input, Select, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { STATUS_MAP } from "@/constants/order";

const { Option } = Select;

interface OrderFilterProps {
  keyword: string;
  setKeyword: (val: string) => void;
  setStatusFilter: (val: string | undefined) => void;
  onSearch: () => void;
}

export default function OrderFilter({
  keyword,
  setKeyword,
  setStatusFilter,
  onSearch,
}: OrderFilterProps) {
  return (
    <div className="flex gap-4 mb-4 flex-wrap bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <Input
        placeholder="Tìm theo Mã đơn / Tên / SĐT..."
        prefix={<SearchOutlined />}
        style={{ width: 300 }}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onPressEnter={onSearch}
      />

      <Select
        placeholder="Lọc trạng thái"
        style={{ width: 180 }}
        allowClear
        onChange={(val) => setStatusFilter(val)}
      >
        {Object.keys(STATUS_MAP).map((key) => (
          <Option key={key} value={key}>
            {STATUS_MAP[key].label}
          </Option>
        ))}
      </Select>

      <Button type="primary" onClick={onSearch}>
        Tìm kiếm
      </Button>
    </div>
  );
}
