# CSV FILE:
File csv sẽ có format như sau:

| address        | amount           | note         |
| -------------- |:----------------:| ------------:|
| ĐC VÍ          | SỐ LƯỢNG TOKEN   | NỘI DUNG GỬI |
| 4VdaXvUqYyB4.. | 0.1              | HELLO WORLD! |


# AIRDROP:
## Args:
**-secrectKey:** Private key của ví gửi
**-csv:** Đường dẫn đến file csv
**-amount:** (Tuỳ chọn) số lượng SOL gửi đến các ví, khi quy định amount thì chương trình sẽ ưu tiên lấy số lượng ở đây thay vì cột Amount trong file CSV.
**-note:** (Tuỳ chọn) Nội dung gửi
**-mul:** (Tuỳ chọn) gửi hàng loạt, mặc định sẽ gửi đến từng ví theo hàng chờ. giá trị là true hoặc false
**-network:** (Tuỳ chọn) mạng của ví mặc định là mainnet-beta
**-programId:** (Tuỳ chọn) ID của chương trình

```bash
node airdrop.js -secrectKey=SECRECT_KEY -csv=FILE.csv -note="NOTE" -amount=0.1 -mul=true/false -programId=PROGRAM_ID -network=devnet
```

# GENERATE:
## Args:
**-length:** Số lượng Public Key
**-output:** Đường dẫn đến file csv
**-amount:** Số lượng SOL gửi đến các ví.
**-note:** (Tuỳ chọn) Nội dung gửi

```bash
node generate.js -length=10 -output=out.csv -amount=0.05 -note="HELLO WORLD"
```