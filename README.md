# CSV FILE:
File csv sẽ có format như sau:

| address        | amount           | note         |
| -------------- |:----------------:| ------------:|
| ĐC VÍ          | SỐ LƯỢNG TOKEN   | NỘI DUNG GỬI |
| 4VdaXvUqYyB4.. | 0.1              | HELLO WORLD! |


# AIRDROP:
## Args:
**-secretKey:** Private key của ví gửi<br/>
**-csv:** Đường dẫn đến file csv<br/>
**-amount:** (Tuỳ chọn) số lượng SOL gửi đến các ví, khi quy định amount thì chương trình sẽ ưu tiên lấy số lượng ở đây thay vì cột Amount trong file CSV<br/>
**-note:** (Tuỳ chọn) Nội dung gửi<br/>
**-mul:** (Tuỳ chọn) gửi hàng loạt, mặc định sẽ gửi đến từng ví theo hàng chờ. giá trị là true hoặc false<br/>
**-network:** (Tuỳ chọn) mạng của ví mặc định là mainnet-beta<br/>
**-programId:** (Tuỳ chọn) ID của chương trình<br/>
**-spl** (Tuỳ chọn) Mint addresss của SPL Token, mặc định là SOL

```bash
airdrop -secretKey=SECRECT_KEY -csv=FILE.csv -note="NOTE" -amount=0.1 -mul=true/false -programId=PROGRAM_ID -network=devnet
```

# GENERATE:
## Args:
**-length:** Số lượng Public Key<br/>
**-output:** Đường dẫn đến file csv<br/>
**-amount:** Số lượng SOL gửi đến các ví<br/>
**-note:** (Tuỳ chọn) Nội dung gửi<br/>

```bash
generate -length=10 -output=out.csv -amount=0.05 -note="HELLO WORLD"
```