import "es6-shim";
import {Contains, MinLength, ValidateNested} from "../../src/decorator/decorators";
import {Validator} from "../../src/validation/Validator";
import {ValidatorOptions} from "../../src/validation/ValidatorOptions";
import {expect} from "chai";

// -------------------------------------------------------------------------
// Setup
// -------------------------------------------------------------------------

const validator = new Validator();

// -------------------------------------------------------------------------
// Specifications: common decorators
// -------------------------------------------------------------------------

describe("nested validation", function() {

    it("should validate nested objects", function() {

        class MySubClass {
            @MinLength(5)
            name: string;
        }

        class MyClass {
            @Contains("hello")
            title: string;

            @ValidateNested()
            mySubClass: MySubClass;

            @ValidateNested()
            mySubClasses: MySubClass[];
        }

        const model = new MyClass();
        model.title = "helo world";
        model.mySubClass = new MySubClass();
        model.mySubClass.name = "my";
        model.mySubClasses = [new MySubClass(), new MySubClass()];
        model.mySubClasses[0].name = "my";
        model.mySubClasses[1].name = "not-short";
        return validator.validate(model).then(errors => {
            console.log(errors);
            errors.length.should.be.equal(3);

            errors[0].target.should.be.equal(model);
            errors[0].property.should.be.equal("title");
            errors[0].constraints.should.be.eql({ contains: "title must contain a hello string" });
            errors[0].value.should.be.equal("helo world");

            errors[1].target.should.be.equal(model);
            errors[1].property.should.be.equal("mySubClass");
            errors[1].value.should.be.equal(model.mySubClass);
            expect(errors[1].constraints).to.be.undefined;
            const subError1 = errors[1].children[0];
            subError1.target.should.be.equal(model.mySubClass);
            subError1.property.should.be.equal("name");
            subError1.constraints.should.be.eql({ minLength: "name must be longer than 5 characters" });
            subError1.value.should.be.equal("my");

            errors[2].target.should.be.equal(model);
            errors[2].property.should.be.equal("mySubClasses");
            errors[2].value.should.be.equal(model.mySubClasses);
            expect(errors[2].constraints).to.be.undefined;
            const subError2 = errors[2].children[0];
            subError2.target.should.be.equal(model.mySubClasses[0]);
            subError2.property.should.be.equal("name");
            subError2.constraints.should.be.eql({ minLength: "name must be longer than 5 characters" });
            subError2.value.should.be.equal("my");
        });
    });

});
